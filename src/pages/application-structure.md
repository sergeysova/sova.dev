---
title: Application structure
description: Where to look for files and where to put new
date: 2019-08-20
language: en
layout: ../layouts/MarkdownLayout.astro
---

# Table of contents

# Introduction

I split my source code on `features/`, `ui/` and `pages/`.<br/>
**Logic** can be only in the `pages/` and `features/`.

Example:

> ▸ — the icon of collapse directory tree

    src/
      api/▸
      features/▸
      lib/▸
      pages/▸
      ui/▸

## 1. [Feature] structure:

    src/
      features/
        account/▸
        editor/▸
        settings/▸
        users/
          atoms/
            index.js
            avatar.js
          lib/
            lib-name/
              index.js
              test.js
              readme.md
          models/▸
          molecules/▸
          organisms/▸
          templates/▸
          index.js

[Feature] — it is useful functionality for users or it is a suite of entities that are united by one idea. For example users, text-editor, accounts, and articles.

[Feature] cannot be grouped by type, it should not be too abstract. Examples **how not to do**: roles, forms, validate.

1. Every feature must have the same structure.
2. `users`, `account`, ... — the arbitrary name of the feature in kebab-case.
3. The feature's content may be received only from `index.js`.
4. Every section can only be created if it has content inside.

- `lib/` it is [inner library] of feature. It must have tests and documentation.
- `index.js` for re-export necessary elements outside.
- `models/` — [effector models] (ru).

### 1.1 [Atomic] in [Feature]

`atoms`, `molecules`, `organisms`, `templates` — [atomic design], [feature]'s components.

If every component assumes many files in such case you should create (`.test`, `.story`, `.md`, ...):

    feature/
      users/
        atoms/▸
        molecules/
          personal-apply/▸
          user-card/
            index.js
            story.js
            test.js
            readme.md
        organisms/▸
        templates/▸

No need of directories if you don't have many files. Important, that in range of feature all look the same.

    feature/
      settings/
        atoms/▸
        molecules/▸
        organisms/
          monitoring-editor.js
          monitoring-editor.test.js
          marketplace.js
          marketplace.test.js

## 2. Page's structure:

    src/
      pages/
        post/
          model.js
          page.js
        posts/
          create/▸
          edit/▸
        auth/
          login/▸
          register/
            model.js
            page.js

1. Page's nesting must map routing of true url.
2. There is source code of component in `page.js`
3. There is uniq logic of the page in `model.js`
4. There is any common logic in [library code] `src/lib/lib-name/`

Examples:

```
src/
  pages/
    post/
      page.js
      model.js
    repo/
      view/
        pulls/▸
        issues/
          view/
            page.js
            model.js
        page.js
        model.js
    index.js
```

- Page of blog post
  - file: `src/pages/post/page.js`
  - route: `/post/:postSlug` (or `/:postSlug`)
  - example: `/post/effector-model`
- Viewer of repository issue
  - file: `src/pages/repo/view/issues/view/page.js`
  - route: `/repo/:repoSlug/issues/:issueId`
  - example: `/repo/effector/issues/5`

## 3. UI structure:

    src/
      ui/
        atoms/
          index.js
          component-name/
            index.js
            readme.js
            story.js
            test.js
        molecules/▸
        organisms/▸
        templates/▸
        index.js

1. [Atomic Design]
2. All UI are building blocks that allow to the creation of any feature.
3. UI must be disconnected from any global stores.
4. Components must be maximally reusable and independent of context _(not React Context API)_.

> Translated by [Murgut]

[atomic design]: http://atomicdesign.bradfrost.com
[atomic]: http://atomicdesign.bradfrost.com
[feature]: https://t.me/feature_slices
[feature]: https://t.me/feature_slices
[feature]: https://t.me/feature_slices
[library code]: https://dev.to/sergeysova/why-utils-helpers-is-a-dump-45fo
[inner library]: https://dev.to/sergeysova/why-utils-helpers-is-a-dump-45fo
[effector models]: /ru/effector-model-structure
[murgut]: https://t.me/murgut
