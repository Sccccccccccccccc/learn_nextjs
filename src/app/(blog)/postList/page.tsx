import type { Metadata } from "next";

import MainNav from "@/components/MainNav/MainNav";

export const metadata: Metadata = {
  title: "PostList",
};

const PostListPage = async ({ params, searchParams }: PageProps<"/postList">) => {
  return (
    <div 
      className="ListContainer y-scroll-box"
    >

      <div className="ListContainer__wrapper flex flex-col p-[2rem] gap-[0.75rem]">

        <div 
          className="
            ListContainer__header 
            flex
            bg-[#1E2939] rounded-[32px] border-[2px] border-gray-700
            w-fit min-w-[350px] px-[1.25rem]
          "
        >
          <MainNav />
        </div>

        <div className="ListContainer__content">
          PostList
        </div>

      </div>
      
    </div>
  );
};

export default PostListPage;
