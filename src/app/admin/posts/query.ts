import type { PostSort, PostStatus } from "@/server/posts";

/**
 * 文章列表的 URL 状态
 * 筛选 / 搜索 / 排序 / 分页全部写进 searchParams，页面本身保持服务端渲染：
 * 刷新、分享链接、多页签都能还原同一份列表。
 */
export type PostsQuery = {
  status: PostStatus;
  keyword: string;
  sort: PostSort;
  page: number;
};

export const POSTS_STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "published", label: "已发布" },
  { value: "draft", label: "草稿" },
];

export const POSTS_SORT_OPTIONS: { value: PostSort; label: string }[] = [
  { value: "updated", label: "最近更新" },
  { value: "created", label: "创建时间" },
  { value: "title", label: "标题" },
];

export type RawSearchParams = {
  status?: string | string[];
  q?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const parsePostsQuery = (params: RawSearchParams): PostsQuery => {
  const status = first(params.status);
  const sort = first(params.sort);
  const page = Number.parseInt(first(params.page) ?? "1", 10);

  return {
    status: status === "published" || status === "draft" ? status : "all",
    keyword: (first(params.q) ?? "").slice(0, 80),
    sort: sort === "created" || sort === "title" ? sort : "updated",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
};

/** 用当前筛选条件拼一个链接，只覆盖显式传入的字段 */
export const buildPostsHref = (
  query: PostsQuery,
  patch: Partial<PostsQuery> = {},
): string => {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();

  if (next.status !== "all") params.set("status", next.status);
  if (next.keyword) params.set("q", next.keyword);
  if (next.sort !== "updated") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const search = params.toString();
  return search ? `/admin/posts?${search}` : "/admin/posts";
};
