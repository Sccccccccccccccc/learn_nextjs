import type { Metadata } from "next";

import { PostForm } from "@/components/admin/PostForm";
import { createPost } from "@/server/actions";

export const metadata: Metadata = {
  title: "写文章",
};

const NewPostPage = async ({ params, searchParams }: PageProps<"/admin/posts/new">) => {
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-head__title">写文章</h1>
          <p className="admin-page-head__desc">
            填写标题与正文，点「发布」直接对前台可见，点「存为草稿」先保存
          </p>
        </div>
      </div>

      <PostForm
        mode="create"
        action={createPost}
        initial={{ title: "", content: "", published: false }}
      />
    </>
  );
};

export default NewPostPage;
