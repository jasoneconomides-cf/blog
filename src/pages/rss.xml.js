import rss from '@astrojs/rss';

const posts = Object.values(import.meta.glob('../content/posts/*.md', { eager: true }));

export async function GET(context) {
  const items = posts
    .map((post) => {
      const slug = post.file.split('/').pop().replace(/\.md$/, '');

      return {
        title: post.frontmatter.title,
        pubDate: new Date(post.frontmatter.pubDate),
        description: post.frontmatter.description,
        link: `/posts/${slug}/`
      };
    })
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'UK Pet Passport Blog',
    description: 'GOV.UK-sourced guidance for UK pet owners travelling abroad after Brexit.',
    site: context.site,
    items
  });
}
