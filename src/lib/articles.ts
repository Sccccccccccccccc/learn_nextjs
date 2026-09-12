import { cacheLife, cacheTag } from "next/cache";

import type { ArticleItemData } from "@/components/ArticleItem/ArticleItem";
import prisma from "@/lib/prisma";

/** 摘要截断长度（按字符算，中文和英文都按字符数） */
const EXCERPT_LENGTH = 120;

/** Post.content 是富文本/markdown，先剥标签压成纯文本，再截断 */
function toExcerpt(content: string | null): string | null {
  if (!content) return null;

  const text = content
    .replace(/<[^>]*>/g, " ") // 去掉 html 标签
    .replace(/[#*`>\-[\]]+/g, " ") // 去掉常见 markdown 记号
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;

  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}…` : text;
}

/** 展示用日期，和 douLog 的 post_date 一样是 YYYY-MM-DD */
function toDate(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 列表数据。
 * "use cache" + cacheTag("articles")：结果进入静态壳，页面保持 instant；
 * 以后发布/修改文章后调用 updateTag("articles") 即可让列表刷新。
 * 只取 published = true 的文章，按创建时间倒序。
 */
export async function getArticles(): Promise<ArticleItemData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, content: true, createdAt: true },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: toExcerpt(post.content),
    date: toDate(post.createdAt),
    // tags / viewCount / commentCount / image：schema 里还没有这些字段，先不传（组件有值才渲染）
  }));
}
