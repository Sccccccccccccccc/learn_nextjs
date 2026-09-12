import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import prisma from "@/lib/prisma";
import { countWords, toExcerpt } from "@/components/admin/format";

/**
 * 后台数据读取层
 * ---------------------------------------------------------------------------
 * 列表 / 详情带 `use cache`：数据不依赖请求上下文，交给 Next 缓存，
 * 静态壳里就能带上内容，首屏不会有「加载中」的空窗；
 * 变更后由 Server Actions 调用 updateTag('posts') 立即失效，保证读写一致。
 *
 * 工作台统计走 connection()：它要展示「今日更新」与相对时间，
 * 属于随请求变化的数据，缓存住反而会误导人。
 */

export const POSTS_TAG = "posts";

/** 列表默认每页条数 */
export const POSTS_PAGE_SIZE = 10;

export type PostStatus = "all" | "published" | "draft";
export type PostSort = "updated" | "created" | "title";

export type PostListItem = {
  id: string;
  title: string;
  excerpt: string;
  published: boolean;
  words: number;
  authorName: string;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PostDetail = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PostListResult = {
  items: PostListItem[];
  total: number;
  page: number;
  pageSize: number;
  /** 数据库不可用时的友好提示，页面照常渲染空状态 */
  error?: string;
};

export type PostFilters = {
  status?: PostStatus;
  /** 标题模糊搜索 */
  keyword?: string;
  sort?: PostSort;
  page?: number;
  pageSize?: number;
};

export type DashboardStats = {
  total: number;
  published: number;
  draft: number;
  words: number;
  updatedToday: number;
  totalUsers: number;
  /** 最近 7 天每天的新建数量，用于迷你柱状图 */
  trend: { label: string; value: number }[];
  error?: string;
};

const DB_ERROR_MESSAGE = "数据库连接失败，请检查 .env 里的 DATABASE_URL 与本地 PostgreSQL 是否已启动。";

const orderByOf = (sort: PostSort | undefined) => {
  switch (sort) {
    case "created":
      return { createdAt: "desc" as const };
    case "title":
      return { title: "asc" as const };
    default:
      return { updatedAt: "desc" as const };
  }
};

const toListItem = (post: {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string | null; email: string };
}): PostListItem => ({
  id: post.id,
  title: post.title,
  excerpt: toExcerpt(post.content),
  published: post.published,
  words: countWords(post.content),
  authorName: post.author.name?.trim() || post.author.email.split("@")[0],
  authorEmail: post.author.email,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

/** 文章分页列表：支持状态筛选、标题搜索、排序 */
export const getPostList = async (filters: PostFilters = {}): Promise<PostListResult> => {
  "use cache";
  cacheLife("minutes");
  cacheTag(POSTS_TAG);

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? POSTS_PAGE_SIZE));
  const keyword = filters.keyword?.trim();

  const where = {
    ...(filters.status === "published"
      ? { published: true }
      : filters.status === "draft"
        ? { published: false }
        : {}),
    ...(keyword ? { title: { contains: keyword, mode: "insensitive" as const } } : {}),
  };

  try {
    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: orderByOf(filters.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          content: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { name: true, email: true } },
        },
      }),
    ]);

    return { items: posts.map(toListItem), total, page, pageSize };
  } catch (error) {
    console.error("[admin] getPostList failed:", error);
    return { items: [], total: 0, page, pageSize, error: DB_ERROR_MESSAGE };
  }
};

/**
 * 工作台专用：最近更新的一批文章
 * 工作台要渲染「5 小时前」这类相对时间，列表又必须在请求时才算，
 * 所以这里显式用 connection() 把读取推到请求阶段，再把结果喂给带缓存的 getPostList。
 */
export const getRecentPostsForDashboard = async (limit = 5): Promise<PostListResult> => {
  await connection();
  return getPostList({ pageSize: limit });
};

/** 单篇文章详情，用于编辑页 */
export const getPostById = async (id: string): Promise<PostDetail | null> => {
  "use cache";
  cacheLife("minutes");
  cacheTag(POSTS_TAG);

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return post ? { ...post, content: post.content ?? "" } : null;
  } catch (error) {
    console.error("[admin] getPostById failed:", error);
    return null;
  }
};

/** 工作台概览数据 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // 工作台展示「今日更新」和相对时间，属于随请求变化的数据：
  // 用 connection() 明确推迟到请求时执行（配合页面的 <Suspense> 流式输出），
  // 既不进静态壳、也不触发 prerender 对 Date.now() 的校验。
  await connection();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const since = new Date(startOfToday);
  since.setDate(since.getDate() - 6);

  try {
    const [total, published, draft, totalUsers, updatedToday, recent, contents] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.user.count(),
      prisma.post.count({ where: { updatedAt: { gte: startOfToday } } }),
      prisma.post.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.post.findMany({ select: { content: true } }),
    ]);

    const buckets = new Map<string, number>();
    for (let index = 0; index < 7; index += 1) {
      const day = new Date(since);
      day.setDate(since.getDate() + index);
      buckets.set(`${day.getMonth() + 1}/${day.getDate()}`, 0);
    }

    for (const post of recent) {
      const key = `${post.createdAt.getMonth() + 1}/${post.createdAt.getDate()}`;
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return {
      total,
      published,
      draft,
      totalUsers,
      updatedToday,
      words: contents.reduce((sum, post) => sum + countWords(post.content), 0),
      trend: [...buckets.entries()].map(([label, value]) => ({ label, value })),
    };
  } catch (error) {
    console.error("[admin] getDashboardStats failed:", error);
    return {
      total: 0,
      published: 0,
      draft: 0,
      totalUsers: 0,
      updatedToday: 0,
      words: 0,
      trend: [],
      error: DB_ERROR_MESSAGE,
    };
  }
};

/**
 * 顶栏「连接状态」用：探活 + 文章总数
 * 缓存 1s 只是为了别让每次导航都打一次库；同时它属于「短生命周期缓存」，
 * Next 会自动把它当成动态洞（不进静态壳）。
 */
export const getDatabaseHealth = async (): Promise<{ ok: boolean; posts: number }> => {
  "use cache";
  cacheLife("seconds");

  try {
    const posts = await prisma.post.count();
    return { ok: true, posts };
  } catch (error) {
    console.error("[admin] getDatabaseHealth failed:", error);
    return { ok: false, posts: 0 };
  }
};
