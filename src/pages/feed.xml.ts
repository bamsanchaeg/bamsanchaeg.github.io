import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

// jekyll-feed 가 만들던 /feed.xml 경로를 유지한다.
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map(({ post, date, url }) => ({
      title: post.data.title,
      pubDate: date,
      description: post.data.description ?? '',
      categories: [post.data.category, ...post.data.tags],
      link: url,
    })),
  });
}
