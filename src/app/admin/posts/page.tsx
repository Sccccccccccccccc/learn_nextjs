import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PostsTable } from "@/components/admin/PostsTable";
import { AlertIcon, CirclePlusIcon, InboxIcon, SearchIcon } from "@/components/admin/icons";
import { getPostList, POSTS_PAGE_SIZE } from "@/server/posts";
import SortSelect from "./SortSelect";
import {
  buildPostsHref,
  parsePostsQuery,
  POSTS_SORT_OPTIONS,
  POSTS_STATUS_OPTIONS,
  type PostsQuery,
  type RawSearchParams,
} from "./query";
import { TableSkeleton } from "@/app/admin/skeletons";
import "../dashboard.css";
import "./posts.css";

export const metadata: Metadata = {
  title: "文章管理",
};

/** 分页：上一页 / 页码窗口 / 下一页 */
const Pagination = ({ query, total }: { query: PostsQuery; total: number }) => {
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PAGE_SIZE));
  if (totalPages <= 1) return null;

  const current = Math.min(query.page, totalPages);
  const start = Math.max(1, Math.min(current - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);

  return (
    <nav className="admin-pagination" aria-label="分页">
      <span className="admin-pagination__total">
        共 {total} 篇 · 第 {current}/{totalPages} 页
      </span>

      <div className="admin-pagination__pages">
        <Link
          className="admin-pagination__btn"
          href={buildPostsHref(query, { page: Math.max(1, current - 1) })}
          aria-disabled={current === 1}
          data-disabled={current === 1 || undefined}
        >
          上一页
        </Link>

        {pages.map((page) => (
          <Link
            key={page}
            className="admin-pagination__btn"
            href={buildPostsHref(query, { page })}
            data-active={page === current || undefined}
            aria-current={page === current ? "page" : undefined}
          >
            {page}
          </Link>
        ))}

        <Link
          className="admin-pagination__btn"
          href={buildPostsHref(query, { page: Math.min(totalPages, current + 1) })}
          aria-disabled={current === totalPages}
          data-disabled={current === totalPages || undefined}
        >
          下一页
        </Link>
      </div>
    </nav>
  );
};

/** 筛选工具条 */
const PostsToolbar = ({ query, total }: { query: PostsQuery; total: number }) => (
  <div className="admin-toolbar">
    <div className="admin-toolbar__group">
      {POSTS_STATUS_OPTIONS.map((option) => (
        <Link
          key={option.value}
          className="admin-chip"
          href={buildPostsHref(query, { status: option.value, page: 1 })}
          data-active={query.status === option.value || undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>

    <form className="admin-toolbar__group" method="get" action="/admin/posts" role="search">
      {query.status !== "all" ? <input type="hidden" name="status" value={query.status} /> : null}
      {query.sort !== "updated" ? <input type="hidden" name="sort" value={query.sort} /> : null}

      <label className="admin-search">
        <SearchIcon size={15} />
        <input
          className="admin-search__input"
          type="search"
          name="q"
          defaultValue={query.keyword}
          placeholder="搜索标题…"
          aria-label="搜索标题"
        />
      </label>

      <button type="submit" className="admin-btn admin-btn--sm">
        搜索
      </button>

      <label className="admin-select-wrap">
        <span className="admin-sr-only">排序方式</span>
        <SortSelect options={POSTS_SORT_OPTIONS} defaultValue={query.sort} />
        <noscript>
          <button type="submit" className="admin-btn admin-btn--sm">
            应用
          </button>
        </noscript>
      </label>

      {query.keyword || query.status !== "all" || query.sort !== "updated" ? (
        <Link className="admin-btn admin-btn--sm admin-btn--text" href="/admin/posts">
          重置
        </Link>
      ) : null}

      <span className="admin-toolbar__total">共 {total} 篇</span>
    </form>
  </div>
);

/** 列表主体：读取筛选结果 */
const PostsSection = async ({ query }: { query: PostsQuery }) => {
  const { items, total, error } = await getPostList({
    status: query.status,
    keyword: query.keyword,
    sort: query.sort,
    page: query.page,
  });

  return (
    <section className="admin-card">
      <PostsToolbar query={query} total={total} />

      {error ? (
        <div className="admin-card__body">
          <div className="admin-alert">
            <AlertIcon size={16} />
            <span>{error}</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__icon">
            <InboxIcon size={26} />
          </span>
          <p className="admin-empty__title">
            {query.keyword ? `没有匹配「${query.keyword}」的文章` : "这里还没有文章"}
          </p>
          <p className="admin-empty__text">
            换个筛选条件，或者直接新建一篇。草稿箱里的文章发布后才会出现在博客前台。
          </p>
          <Link
            className="admin-btn admin-btn--primary"
            href="/admin/posts/new"
            style={{ marginTop: 8 }}
          >
            <CirclePlusIcon size={14} />
            写文章
          </Link>
        </div>
      ) : (
        <PostsTable items={items} />
      )}

      <Pagination query={query} total={total} />
    </section>
  );
};

/**
 * searchParams 属于「请求时才有的数据」，必须放在 Suspense 边界内读取，
 * 否则整条路由都无法预渲染（Cache Components 会报 blocking-prerender-runtime）。
 * 所以这里把 await 收在这一层，页面静态部分照常进静态壳。
 */
const PostsSectionWithQuery = async ({
  searchParams,
}: Pick<PageProps<"/admin/posts">, "searchParams">) => {
  const query = parsePostsQuery((await searchParams) as RawSearchParams);
  return <PostsSection query={query} />;
};

const PostsPage = async ({ params, searchParams }: PageProps<"/admin/posts">) => {
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-head__title">文章管理</h1>
          <p className="admin-page-head__desc">
            每页 {POSTS_PAGE_SIZE} 条 · 支持按状态筛选、标题搜索与排序
          </p>
        </div>
        <div className="admin-page-head__actions">
          <Link className="admin-btn admin-btn--primary" href="/admin/posts/new">
            <CirclePlusIcon size={14} />
            写文章
          </Link>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <PostsSectionWithQuery searchParams={searchParams} />
      </Suspense>
    </>
  );
};

export default PostsPage;
