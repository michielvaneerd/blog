---
title: 'Astro and Pagefind on Github Pages'
description: 'Publishing an Astro website with Pagefind to Github Pages on a subpath and without Github Actions but using a separate branch instead and from the `/docs` directory.'
pubDate: 2026-10-11
tags: ["astro", "pagefind", "ai-generated-content"]
---

This post explains how to publish your site made with Astro and Pagefind on Github Pages and makes **extensive** use of AI generated content, in this case a locally running gemma4:12b-mlx.

## What are Astro, Pagefind and Github Pages

First what are Astro, Pagefind and Github Pages?

Astro is a content-focused web framework that prioritizes performance by shipping zero client-side JavaScript by default, rendering layouts to static HTML. It employs an “Islands Architecture” to selectively hydrate interactive components, ensuring that only the necessary interactive elements incur a runtime overhead. The framework is UI-agnostic, allowing developers to seamlessly mix and match components from React, Vue, Svelte, and other popular libraries within the same project.

Pagefind is a high-performance, static search engine that indexes your website’s content during the build process to provide full-text search capabilities without a backend. It generates a compact, JSON-based index file that is queried via a lightweight client-side JavaScript library, ensuring minimal latency and zero infrastructure overhead. It is framework-agnostic and integrates seamlessly with any static site generator (SSG) or modern web framework to deliver a robust search experience.

GitHub Pages is a static site hosting service provided by GitHub that deploys and serves web content directly from a repository’s branches or folders. It integrates natively with GitHub Actions to provide automated deployment pipelines, making it a standard choice for hosting documentation, portfolios, and sites built with static site generators. The service manages the hosting infrastructure and distribution, allowing developers to deploy frontend-heavy projects without the need for a dedicated backend server.

## Why use them together?

This stack is an ideal choice for developers who want to build **high-performance, content-heavy websites** (like blogs, documentation, or portfolios) while maintaining a **zero-infrastructure** overhead. 

The synergy between these three technologies can be broken down into three core benefits:

### 1. Seamless "Static-First" Architecture
All three tools are designed to work in a static environment. 
*   **Astro** generates the static HTML pages.
*   **Pagefind** indexes those static files during the build process.
*   **GitHub Pages** serves those final static files.
Because none of these components require a running database or a persistent backend server (like Node.js or Python), you eliminate the complexity of managing server state, security patches, or database scaling.

### 2. Superior Performance and Search Experience
One of the biggest challenges with static sites is providing robust search functionality without a heavy backend (like Elasticsearch or Algolia). 
*   **Pagefind** solves this by creating a searchable index of your Astro-generated content.
*   Because **Astro** ships minimal JavaScript to the client, the site remains incredibly fast.
*   Combining them allows you to offer **full-text search** that feels instantaneous because the search index is handled entirely on the client side, served via **GitHub Pages**' global CDN.

### 3. Optimized Developer Experience (DX) and Workflow
This stack aligns perfectly with modern "GitOps" workflows:
*   **Deployment:** You can automate the entire pipeline using **GitHub Actions**. When you push code to your repository, GitHub Actions can run the Astro build, trigger the Pagefind indexing, and deploy the result to GitHub Pages automatically.
*   **Cost:** For many projects, this entire stack is **free** (or extremely low-cost), as GitHub Pages offers free hosting for public repositories and Pagefind is a free, open-source tool.
*   **Type Safety and Integration:** Since Astro supports TypeScript and Pagefind works with any static file structure, you can maintain a strictly typed, predictable build pipeline from the moment you write a Markdown file to the moment it is searchable online.

**Summary:** You are essentially using **Astro** as the architect, **Pagefind** as the librarian, and **GitHub Pages** as the storefront. Together, they provide a professional-grade content platform with almost zero maintenance.

## Caveats

When hosting on a subpath like /blog, the browser expects all internal links and static assets to be relative to that specific subdirectory rather than the root of the domain. If the base configuration is not explicitly set, Astro will generate absolute paths (e.g., /assets/...) that resolve to the root domain, resulting in broken links and 404 errors for your CSS, JS, and internal routes. Consequently, you must manually configure the base and site properties in astro.config.mjs to ensure the build engine correctly prefixes all generated URLs. The same is true for Pagefind, where you have to set the `bundle-path`.



Wat ik wil vertellen:
- Website gemaakt van Astro + Pagefind publiceren op Github Pages.
- We publiceren de website als een project site, waarmee de locatie wordt: `http(s)://<owner>.github.io/<repositoryname>`
- Kan ook met Github Actions, maar ik kies er hiervoor om de site lokaal te bouwen en dan te pushen naar een bepaalde branch.

Github Pages info
- Kies branch van waaruit je site wil publiceren. Kan vanuit `main`, maar beter is om hier een aparte branch voor te kiezen, zodat je in `main` kunt pushen zonder dat dit meteen een nieuwe site oplevert.
- Github Pages verwacht dat de site zich bevindt in de `/docs` directory. Op dit moment kun je dat niet op iets anders zetten.

Astro info:
- Omdat de site op Github Pages **niet** vanuit de root wordt geserveerd, maar vanuit een pad dat gelijk is aan de repository name, moet je dit Astro laten weten, want internal links die beginnen met / linken altijd naar de root. Dit doe je met de `base` config.

Pagefind info:
- Pagefind verwacht de index files ook in de root, dus ook hierbij moet je aangeven dat deze zich nu in een sub-path bevinden, dat doe je met de `bundle-path` config.

Flow info:
- Ontwikkel in main en als je wil publiceren:
    - pnpm build
    - npx pagefind --site docs
- Push naar je branch voor GHP.
- Na verwerken is site te zien.

## Astro

Set the `site` to your Github Pages host and `base` to your Github Pages subpath.

```javascript
export default defineConfig({
    site: 'https://michielvaneerd.github.io',
    base: '/blog',
    trailingSlash: 'never',
    outDir: './docs'
});
```

Now every internal link should be prefixed with `import.meta.env.BASE_URL`:

Before:

```html
<a href=`/posts`>Home</a>
```

After:

```html
<a href=`${import.meta.env.BASE_URL}/posts`>Home</a>
```

Also set the `outDir` to `./docs`, because this is the fixed directory that Github Pages uses for your published website.

Build your site like normally:

```bash
pnpm build
```

Now your built site is available in the `./docs` directory.

## Pagefind

Pagefind will look for the index files in `/pagefind`, but because we now serve from a subpath `/blog` the full path will be `/blog/pagefind/`, so add this `bundle-path` config before adding Pagefind:

```html
<pagefind-config bundle-path=`${import.meta.env.BASE_URL}/pagefind/`></pagefind-config>
<pagefind-modal-trigger></pagefind-modal-trigger>
<pagefind-modal></pagefind-modal>
```

Build the Pagefind index with:

```bash
npx pagefind --site docs
```

Now there should be a `./docs/pagefind` containing everything Pagefind needs.

## Publishing

Github Pages now uses the configured branch and the `/docs` directory to serve your website.