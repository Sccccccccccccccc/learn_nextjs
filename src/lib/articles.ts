import { cacheLife, cacheTag } from "next/cache";

import type { ArticleItemData } from "@/components/ArticleItem";
import { countWords } from "@/components/admin/format";
import prisma from "@/lib/prisma";

/** 摘要截断长度（按字符算，中文和英文都按字符数） */
const EXCERPT_LENGTH = 120;

/** 估算阅读时长的基准速度（字/分钟），中文阅读取 350 左右；结果至少 1 分钟 */
const READING_WORDS_PER_MINUTE = 350;

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
 * 前台文章列表的缓存标签。
 * 后台的写操作（src/server/actions.ts）在 updateTag('posts') 时会一并失效这个标签，
 * 否则「刚发布的文章」要等 cacheLife 过期才会出现在前台列表里。
 */
export const ARTICLES_TAG = "articles";

/**
 * 列表数据。
 * "use cache" + cacheTag：结果进入静态壳，页面保持 instant。
 * 只取 published = true 的文章，按创建时间倒序。
 */
export async function getArticles(): Promise<ArticleItemData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(ARTICLES_TAG);

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

/** 详情页数据。列表项那套字段之外，多了正文与作者信息。 */
export type ArticleDetail = {
  id: string;
  title: string;
  /** 原始 markdown 正文，渲染交给 <ArticleContent /> */
  content: string;
  /** 摘要（列表页同一套截断规则），详情页拿它当 meta description */
  excerpt: string;
  date: string;
  /** 最后一次修改的日期，和 date 相同则不展示 */
  updatedDate: string;
  authorName: string;
  /** 预计阅读时长（分钟） */
  readingMinutes: number;
};

/**
 * 单篇文章详情（前台动态路由 /blog/[id] 用）。
 * ---------------------------------------------------------------------------
 * - 和列表一样走 "use cache" + ARTICLES_TAG：正文不随请求变化，缓存住之后
 *   构建期预渲染的静态页里直接带着正文；构建之后才发布的文章按需渲染一次、
 *   结果同样存下来。后台写入时 actions.ts 会 updateTag ARTICLES_TAG，
 *   所以「刚改完的文章」不会读到旧缓存。
 * - where 里带上 published: true —— 草稿的 id 即使被人猜到并直接敲进地址栏，
 *   也只会拿到 null（页面据此走 notFound()），不会把未发布正文漏出去。
 * - 这里不吞异常：数据库挂了就让错误冒到 error 边界，别伪装成「文章不存在」。
 */
export async function getArticleById(id: string): Promise<ArticleDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(ARTICLES_TAG);

  const post = await prisma.post.findFirst({
    where: { id, published: true },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { name: true, email: true } },
    },
  });

  if (!post) return null;

  const content = post.content ?? "";
  const words = countWords(content);

  return {
    id: post.id,
    title: post.title,
    content,
    // 本地 toExcerpt 在正文全空时返回 null（列表那边靠「有值才渲染」处理），
    // 详情页要拿它当 meta description，这里统一成空串
    excerpt: toExcerpt(content) ?? "",
    date: toDate(post.createdAt),
    updatedDate: toDate(post.updatedAt),
    // 和后台列表一致：没起名字就用邮箱 @ 前面那段
    authorName: post.author.name?.trim() || post.author.email.split("@")[0],
    readingMinutes: Math.max(1, Math.round(words / READING_WORDS_PER_MINUTE)),
  };
}
