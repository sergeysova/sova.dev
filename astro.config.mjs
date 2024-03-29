import 'dotenv/config';
import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import prefetch from '@astrojs/prefetch';
import image from '@astrojs/image';

import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePresetMinify from 'rehype-preset-minify';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE,
  markdown: {
    remarkPlugins: [remarkToc, remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, ...rehypePresetMinify.plugins],
    syntaxHighlight: 'prism',
  },
  integrations: [
    tailwind({config: {path: './tailwind.config.cjs'}}),
    react(),
    sitemap(),
    prefetch(),
    mdx({
      drafts: true,
    }),
    image(),
  ],
});
