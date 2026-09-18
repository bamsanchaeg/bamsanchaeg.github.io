import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const FILENAME_DATE = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;

/** 파일명 `YYYY-MM-DD-slug` 에서 날짜와 slug를 읽는다. front matter의 date가 있으면 그것을 우선한다. */
export function postMeta(post: Post) {
  const m = post.id.match(FILENAME_DATE);
  const date = post.data.date ?? (m ? new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00+09:00`) : new Date(0));
  const slug = m ? m[4] : post.id;
  const pad = (n: number) => String(n).padStart(2, '0');
  // Jekyll permalink: /log/:year/:month/:day/:title/
  const url = `/log/${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${slug}/`;
  return { date, slug, url };
}

/** 날짜 내림차순 전체 글 */
export async function getPosts() {
  const posts = await getCollection('posts');
  return posts
    .map((post) => ({ post, ...postMeta(post) }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}
