---
title: 'Astro and Pagefind on Github Pages'
description: 'Publishing an Astro website with Pagefind search to Github Pages as a project site. Mainly describes how to deal with the subpath that is added after the domain.'
pubDate: 2026-10-11
tags: ["astro", "pagefind", "github-pages"]
---

## What are Astro, Pagefind and Github Pages?

Astro is a static site generator that creates a content-heavy site from Markdown files. By default it doesn't serve Javascript, but this can be added by using “Islands Architecture”.

Pagefind is a search engine that indexes your website's content during the build process to provide full-text search capabilities without a database. It generates an index that is queried via a client-side JavaScript library.

GitHub Pages is a static site hosting service provided by GitHub that deploys and serves web content directly from a repository’s branch and/or folder. Therefore it is ideal for static sites.

## What makes these 3 a good fit?

All three focus on static sites and complement each other:
- Astro builds the HTML files from the Markdown content.
- Pagefind indexes the content and makes them available with their search widget and API.
- Github Pages serves the static HTML and Javascript files.

The advantages are:
- No backend administration is needed.
- Cheap - If you publish a *project* site at Github Pages there are no costs.
- Performance - Only static files are served.
- Safe - No passwords and backend administrators.
- Both site and content are in the repository.

## Github Pages *project* site with default domain and subpath

When you publish a project site for a public repository at Github Pages and don't use a custom domain, the site will be published at `https://GITHUB_USERNAME.github.io/REPOSITORY_NAME`. This means your site will be available at a subpath of the domain and not at the root. This has consequences for both the Astro and Pagefind configuration, which is explained below.

## Astro

The following Astro config displays some required keys for Github Pages:

```javascript
export default defineConfig({
    site: 'https://michielvaneerd.github.io',
    base: '/blog',
    trailingSlash: 'never',
    outDir: './docs'
});
```

### The `site` and `base` config

Set the `site` to your Github Pages domain and `base` to your repository name. In the example above, the site is available at https://michielvaneerd.github.io/blog.

Every internal link should also be prefixed with `import.meta.env.BASE_URL`:

**Before:**

```html
<a href=`/posts`>Home</a>
```

**After:**

```html
<a href=`${import.meta.env.BASE_URL}/posts`>Home</a>
```

### The `outDir` config

Set the `outDir` to `./docs`, because this is the (required) directory that Github Pages uses as the source of your website.

Build your site:

```bash
pnpm build
```

Now your site is available in the `./docs` directory.

## Pagefind

Pagefind will look for the index files in `/pagefind`, but because we now serve from a subpath `/blog` the full path will be `/blog/pagefind/`, so add this `bundle-path` config before adding the Pagefind widget (don't forget the last forward slash):

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

## Publishing on Github Pages

There are 2 ways you can publish your site to Github Pages: by building locally and pushing it all to Github, or by using Github Actions. I use the first opion, because this one is the easiest to understand.

Set up the Github Pages section in the Settings of your repository. The 2 important ones are:
1. Choose the branch you want Github to publish your site from. I use the main branch for ongoing development, and this should never be published, so I choose a dedicated branch.
2. Choose the `/docs` directory that will contain your built site.

Now everytime you push to this branch, your site will be updated.
