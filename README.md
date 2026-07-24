# UK Pet Passport Blog

GOV.UK-sourced guidance for UK pet owners travelling abroad after Brexit.

Built with [Astro](https://astro.build) and deployed on [Cloudflare Pages](https://pages.cloudflare.com).

## Local development

```bash
npm install
npm run dev
```

## Publishing a New Post

Add a Markdown file to `src/content/posts/` with `title`, `description`, `pubDate`, `image`, `imageAlt`, and `category` frontmatter. Add the article image to `public/images/blog/`, then run:

```bash
npm run build
```

The homepage, RSS feed, and sitemap update automatically from the post files. See `AGENTS.md` for the full SOP.
