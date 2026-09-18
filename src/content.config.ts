import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 학습 기록. 파일명은 Jekyll 관례(YYYY-MM-DD-slug.md)를 그대로 따른다.
 * `date`를 front matter에 적지 않으면 파일명에서 읽는다 (src/lib/posts.ts).
 */
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    category: z.string().default('기록'),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

/**
 * 포트폴리오 프로젝트. 본문은 write-up(문제 · 설계 · 결과 · 회고),
 * front matter는 /portfolio/ 카드에 쓰이는 메타데이터.
 */
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    period: z.string(),
    status: z.enum(['진행중', '완료', '보류']).default('진행중'),
    stack: z.array(z.string()).default([]),
    repo: z.url().optional(),
    demo: z.string().optional(),
    order: z.number().default(100),
  }),
});

export const collections = { posts, projects };
