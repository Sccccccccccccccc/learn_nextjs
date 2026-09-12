import type { Metadata } from "next";

import ArticleItem from "@/components/ArticleItem/ArticleItem";
import MainNav from "@/components/MainNav/MainNav";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "PostList",
};

const PostListPage = async ({ params, searchParams }: PageProps<"/postList">) => {
  const articles = await getArticles();

  return (
    // h-dvh：把整页做成滚动视口（body 是 overflow: hidden）
    <div className="ListContainer h-dvh">
      {/* 内容列：最宽 1000px，页面居中；窄屏自动收窄（不是固定 1000px） */}
      <div className="ListContainer__wrapper w-full max-w-[1000px] mx-auto flex flex-col p-[2rem] gap-[0.75rem]">
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

        {/* 列表卡片：对应 douLog 的 .article-list（同一张卡里纵向排列，间距 1rem） */}
        <div
          className="
            ListContainer__content
            w-full bg-[#1E2939] rounded-[32px] border-[2px] border-gray-700
            px-[1.25rem] py-[1.25rem] sm:px-[2rem] sm:py-[2rem]
            flex flex-col gap-y-[1rem]
          "
        >
          {articles.length === 0 ? (
            <div className="py-12 text-center text-[#94a3b8]">
              还没有已发布的文章
            </div>
          ) : (
            <>
              {articles.map((article) => (
                <ArticleItem key={article.id} article={article} />
              ))}

              {/* 对应 douLog 的 .load-more：先落样式，触底加载的逻辑待接 */}
              <div
                className="
                  w-full py-2 text-center text-base cursor-pointer rounded-xl transition-colors
                  bg-[#60a5fa1a] text-[#93c5fd] hover:bg-[#60a5fa2e]
                "
              >
                加载更多
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostListPage;
