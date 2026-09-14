import Link from "next/link";

import { MainNav } from "@/components/MainNav";

/**
 * /blog/[id] 的 404
 * ---------------------------------------------------------------------------
 * page.tsx 里 getArticleById 返回 null（不存在、没发布、已删除）时调用 notFound()，
 * 就会落到这里。它是所在路由段最近的一个 not-found 边界，会渲染在 (blog) 布局里
 * —— 也就是 GeometricBackground 与 Footer 之间，但不会再经过 page.tsx 的外壳，
 * 所以这里自己再摆一次导航和卡片，保证和列表页看起来是同一个站点。
 *
 * 状态码说明：正文是在流式响应开始之后才判断出「文章不存在」的，
 * 此时 HTTP 状态已经发出去了（200），拿不回来；Next 会注入 noindex 兜住 SEO。
 * 想要真正的 404 状态码，得在 proxy 里就把 id 校验掉。
 */

const ArticleNotFound = () => {
  return (
    <div className="h-dvh">
      <div className="w-full max-w-[1000px] mx-auto flex flex-col p-[2rem] gap-[0.75rem]">
        <div
          className="
            flex
            bg-[#1E2939] rounded-[32px] border-[2px] border-gray-700
            w-fit min-w-[350px] px-[1.25rem]
          "
        >
          <MainNav />
        </div>

        <div
          className="
            w-full bg-[#1E2939] rounded-[32px] border-[2px] border-gray-700
            px-[1.25rem] py-[1.25rem] sm:px-[2rem] sm:py-[2rem]
            flex flex-col items-center gap-[0.5rem] text-center
          "
        >
          <div className="text-[3rem] font-bold leading-none text-[#60a5fa]">404</div>
          <h1 className="text-[1.25rem] font-bold text-[#e5eaf3]">没有找到这篇文章</h1>
          <p className="max-w-[28rem] text-[0.875rem] text-[#94a3b8]">
            它可能已经被删除，或者还只是后台里的草稿。检查一下地址里的 id，或者回列表看看其它文章。
          </p>
          <Link
            href="/postList"
            className="
              mt-[0.75rem] inline-flex items-center rounded-xl
              bg-[#60a5fa1a] px-[1.25rem] py-[0.5rem] text-[0.875rem] text-[#93c5fd]
              transition-colors hover:bg-[#60a5fa2e] hover:text-[#bfdbfe]
            "
          >
            返回文章列表
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleNotFound;
