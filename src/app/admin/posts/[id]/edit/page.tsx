import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import PostForm from "@/components/admin/PostForm";
import PostRowActions from "@/components/admin/PostRowActions";
import { AlertIcon } from "@/components/admin/icons";
import { updatePost } from "@/server/actions";
import { getPostById } from "@/server/posts";
import { TableSkeleton } from "../../../skeletons";
import "../../../dashboard.css";
import "../../posts.css";

export const metadata: Metadata = {
  title: "编辑文章",
};

const PostNotFound = ({ id }: { id: string }) => (
  <section className="admin-card">
    <div className="admin-empty">
      <span className="admin-empty__icon">
        <AlertIcon size={26} />
      </span>
      <p className="admin-empty__title">找不到这篇文章</p>
      <p className="admin-empty__text">
        ID <span className="admin-table__mono">{id}</span> 在数据库里不存在，可能已经被删除。
      </p>
      <Link className="admin-btn admin-btn--primary" href="/admin/posts" style={{ marginTop: 8 }}>
        返回文章列表
      </Link>
    </div>
  </section>
);

/**
 * 动态 params 与 searchParams 都属于「请求时才有的数据」，
 * 必须在 Suspense 边界内读取，否则整条路由无法预渲染。
 */
const EditPostContent = async ({
  params,
  searchParams,
}: Pick<PageProps<"/admin/posts/[id]/edit">, "params" | "searchParams">) => {
  const { id } = await params;
  const { saved } = await searchParams;
  const post = await getPostById(id);

  if (!post) {
    return (
      <>
        <div className="admin-page-head">
          <div>
            <h1 className="admin-page-head__title">编辑文章</h1>
            <p className="admin-page-head__desc">该记录不存在或已删除</p>
          </div>
        </div>
        <PostNotFound id={id} />
      </>
    );
  }

  const savedFlag = Array.isArray(saved) ? saved[0] : saved;

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-head__title">编辑文章</h1>
          <p className="admin-page-head__desc">修改后记得保存，发布状态由右侧按钮决定</p>
        </div>
        <div className="admin-page-head__actions">
          <PostRowActions id={post.id} title={post.title} redirectAfterDelete="/admin/posts" />
        </div>
      </div>

      <PostForm
        mode="edit"
        action={updatePost.bind(null, post.id)}
        initial={{ title: post.title, content: post.content, published: post.published }}
        saved={savedFlag === "created" || savedFlag === "updated" ? savedFlag : null}
        meta={{
          id: post.id,
          authorId: post.authorId,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        }}
      />
    </>
  );
};

const EditPostPage = async ({ params, searchParams }: PageProps<"/admin/posts/[id]/edit">) => {
  return (
    <Suspense
      fallback={
        <>
          <div className="admin-page-head">
            <div>
              <h1 className="admin-page-head__title">编辑文章</h1>
              <p className="admin-page-head__desc">正在读取文章…</p>
            </div>
          </div>
          <TableSkeleton rows={5} />
        </>
      }
    >
      <EditPostContent params={params} searchParams={searchParams} />
    </Suspense>
  );
};

export default EditPostPage;
