// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://michielvaneerd.github.io',
    base: '/blog',
    trailingSlash: 'never',
    outDir: './docs',
    markdown: {
        shikiConfig: {
            theme: 'night-owl-light',
        },
    },
    redirects: {
        '/': '/blog/posts',
    }
});
