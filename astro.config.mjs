// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://bamsanchaeg.github.io',
  base: '/',
  trailingSlash: 'always',
  integrations: [mdx(), react()],
  build: {
    // Jekyll 시절과 동일하게 /path/ → /path/index.html 로 출력
    format: 'directory',
  },
});
