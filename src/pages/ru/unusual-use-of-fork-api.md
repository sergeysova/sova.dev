---
title: Необычное использование Fork API
description: Как еще можно применить Fork API если не SSR или тесты?
date: 2022-09-18
layout: ../../layouts/MarkdownLayout.astro
---

# Table of Contents

# Введение

Когда заходит разговор о применении fork API, обычно вспоминают серверный рендеринг и тестирование логики. В этом
рассказе спешу рассказать и показать более широкий спектр возможных применений этого API.

# Да кто такой этот ваш Fork API 🔨

## Проблема

[effector]: https://effector.dev

Обычно [effector][effector] хранит значения сторов непосредственно внутри объектов созданных через `createStore`. Хуки
React или SolidJS вытаскивают
значение [напрямую из этого объекта](https://github.com/effector/effector/blob/88d721a0a0279109e4a45ba79568b5197152b080/src/react/apiBase.ts#L10)
по ссылке.

```tsx
const $name = createStore('Sergey Sova');

function Component() {
  const name = useStore($name);
  return <div>Name: {name}</div>;
}
```

В случае с SSR, на стороне сервера одновременно могут обрабатываться множество клиентских запросов и серверу нужно одновременно отдавать разным клиентам изолированное состояние. Как мы помним Node.JS/Deno/Bun — однопоточная среда, но за счет асинхронности удается добиться так называемой одновремености исполнения. Пока обработчик клиента А ждет ответа от базы данных или HTTP-запроса, сервер будет обрабатывать запрос клиентов Б или В.

Мы не можем полагаться на синхронную обработку логики, ведь [эффекты](https://effector.dev/ru/docs/api/effector/effect) буквально являются контейнерами для асинхронной логики. Довольно легко представить себе ситуацию, когда _одновременный_ доступ разных клиентов к значениям общего стора может все сломать.

Пока у нас один клиент работает с этими сторами, все окей.

```ts
const reset = createEvent();
const run = createEvent();

const waitFx = createEffect(() => {
  return new Promise((resolve) => setTimeout(resolve, 100));
});

const $counter = createStore([]);

$counter.reset(reset);

$counter.on(run, (list, name) => [...list, `manual ${name}`]);

sample({
  clock: run,
  target: waitFx,
});

$counter.on(waitFx.done, (list, {params: name}) => [...list, `fx done ${name}`]);

$counter.watch((i) => console.log('counter', i));
// counter []

run('A');
// counter ["manual A"]

run('B');
// counter ["manual A", "manual B"]

// counter ["manual A", "manual B", "fx done A"]
// counter ["manual A", "manual B", "fx done A", "fx done B"]
```

[Playground](https://share.effector.dev/5oBljPUk)

Допустим `run('A')` и `run('B')` это вызовы разных клиентов. Здесь наглядно видно, что модифицируется общий массив, и в итоге по окончанию вычислений клиенты получат смешанное состояние. Если бы это был стор с обычными значениями, то клиенты получали бы чужое состояние. Вызов ивента `reset` между запусками никак не спасет ситуацию:

```ts
run('A');
// counter ["manual A"]

reset();
// counter []

run('B');
// counter ["manual B"]

// counter ["manual B", "fx done A"]
// counter ["manual B", "fx done A", "fx done B"]
```

[Playground](https://share.effector.dev/6bzTKXwA)

Теперь просто потеряно одно из значений массива, тогда как `"fx done A"` все еще будет добавлен.

## Решение — Scope

А что если хранить значения сторов для каждого клиента в отдельном месте?

```ts
// Псевдокод
const clientA = {stores: new Map()};
const clientB = {stores: new Map()};

// Когда клиент A запускает свои вычисления,
// читать и записывать значения сторов в объект clientA

run('A');
clientA.stores.set($counter, ['manual A']);
```

Примерно так и работает fork API. С помощью вызова `fork()` мы создаем специальный объект — scope, в котором будут храниться все значения сторов. Именно для этого, в SSR необходимо заворачивать компоненты React или SolidJS в `Provider`.

```tsx
const scope = fork();

export function Init() {
  return (
    <Provider value={scope}>
      <App />
    </Provider>
  );
}
```

Чтобы запустить вычисления в скоупе необходимо использовать `allSettled` или [`useEvent`](https://effector.dev/ru/docs/api/effector-react/useEvent):

```ts
await allSettled(run, {
  scope,
  params: 'A',
});
```

[Playground](https://share.effector.dev/h9rENxUp)

Работает это относительно просто:
юнит переданный в `allSettled` первым аргументом будет хранить в себе ссылку на `scope`, сторы прочитают значение из этого объекта, если значения еще не было, используют `.defaultState`, и запишут изменения обратно в scope. Эффекты работают чуть сложнее, ведь в них необходимо корректно сохранять значение scope между асинхронными вызовами, но идея думаю понятна.
