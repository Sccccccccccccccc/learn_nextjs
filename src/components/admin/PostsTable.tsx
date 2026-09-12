"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import PostRowActions from "@/components/admin/PostRowActions";
import PostStatusTag from "@/components/admin/PostStatusTag";
import { formatDateTime, formatRelative } from "@/components/admin/format";
import { setPostPublished } from "@/server/actions";
import type { PostListItem } from "@/server/posts";

/**
 * 文章表格（客户端组件）
 * 需要交互的部分只有「批量选择 / 批量发布」和「发布状态开关」，
 * 其余（筛选、搜索、分页）都是链接跳转，交给服务端。
 */
const PostsTable = ({ items }: { items: PostListItem[] }) => {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allSelected = items.length > 0 && selected.length === items.length;

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleAll = () =>
    setSelected(allSelected ? [] : items.map((item) => item.id));

  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const bulkPublish = (published: boolean) => {
    startTransition(async () => {
      const results = await Promise.all(selected.map((id) => setPostPublished(id, published)));
      const failed = results.filter((result) => !result.ok).length;

      setMessage(failed === 0 ? `已更新 ${selected.length} 篇文章` : `${failed} 篇更新失败`);
      setSelected([]);
      router.refresh();
    });
  };

  return (
    <>
      {selected.length > 0 ? (
        <div className="admin-table-toolbar" data-floating>
          <span className="admin-table-toolbar__count">
            已选 <b>{selected.length}</b> 项
          </span>
          <div className="admin-table-toolbar__actions">
            <button
              type="button"
              className="admin-btn admin-btn--sm admin-btn--primary"
              onClick={() => bulkPublish(true)}
              disabled={pending}
            >
              批量发布
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              onClick={() => bulkPublish(false)}
              disabled={pending}
            >
              转为草稿
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--sm admin-btn--text"
              onClick={() => setSelected([])}
              disabled={pending}
            >
              取消选择
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="admin-table-note">{message}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="全选本页"
                />
              </th>
              <th>标题</th>
              <th style={{ width: 96 }}>状态</th>
              <th style={{ width: 120 }}>作者</th>
              <th style={{ width: 88 }}>字数</th>
              <th style={{ width: 160 }}>创建时间</th>
              <th style={{ width: 120 }}>更新时间</th>
              <th style={{ width: 190 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((post) => (
              <tr key={post.id} data-selected={selectedSet.has(post.id) || undefined}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSet.has(post.id)}
                    onChange={() => toggleOne(post.id)}
                    aria-label={`选择 ${post.title}`}
                  />
                </td>
                <td>
                  <div className="admin-post-cell">
                    <Link className="admin-post-cell__title" href={`/admin/posts/${post.id}/edit`}>
                      {post.title}
                    </Link>
                    <span className="admin-post-cell__excerpt">
                      {post.excerpt || "（空正文）"}
                    </span>
                  </div>
                </td>
                <td>
                  <PostStatusTag published={post.published} />
                </td>
                <td title={post.authorEmail}>{post.authorName}</td>
                <td>{post.words.toLocaleString("zh-CN")}</td>
                <td className="admin-table__mono">{formatDateTime(post.createdAt)}</td>
                <td title={formatDateTime(post.updatedAt)}>{formatRelative(post.updatedAt)}</td>
                <td>
                  <div className="admin-table__actions">
                    <PostRowActions id={post.id} title={post.title} />
                    <button
                      type="button"
                      className="admin-btn admin-btn--text admin-btn--sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await setPostPublished(post.id, !post.published);
                          setMessage(result.ok ? "状态已更新" : result.error);
                          router.refresh();
                        })
                      }
                    >
                      {post.published ? "转草稿" : "发布"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="admin-table-footnote">
        共 {items.length} 行 · 鼠标悬停可查看完整时间 · 点击标题进入编辑页
      </p>
    </>
  );
};

export default PostsTable;
