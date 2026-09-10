import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PostList",
};

const PostListPage = async ({ params, searchParams }: PageProps<"/postList">) => {
  return (
    <div>
      PostList
    </div>
  );
};

export default PostListPage;
