import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleContent } from "@/components/ArticleContent";
import { MainNav, MainNavPlaceholder } from "@/components/MainNav";
import { getArticleById, getArticles } from "@/lib/articles";

/**
 * 文章详情（动态路由）
 * ---------------------------------------------------------------------------
 * 目录名 `[id]` 就是动态段：/blog/cmtyuy9w9luarktzuh49ovdgp 里的那串 id 会作为
 * `params.id` 传进来（列表页 ArticleItem 的 href 正是 `/blog/${id}`）。
 *
 * 两条渲染路径，配合起来保证「发新文章不用重新构建、老文章直接吃静态产物」：
 *   1. generateStaticParams 把已发布文章的 id 交给构建期 -> 这些 id 出整页静态 HTML；
 *   2. 不在名单里的 id（构建之后才发布的）走按需渲染 —— 此时 params 属于
 *      「请求时才知道」的数据，cacheComponents 要求 await params 发生在 <Suspense>
 *      边界内，所以下面用 Suspense 包住读参数与取正文的部分，先流出外壳再补内容
 *      （后台编辑页也是这个写法）。首次访问的结果会被存下来，之后就是静态产物。
 *
 * 正文由 getArticleById 走 "use cache" + ARTICLES_TAG 缓存，后台写入时
 * actions.ts 会 updateTag(ARTICLES_TAG)，静态页与缓存一起失效，不会读到旧内容。
 *
 * 关于 metadata：Next 不允许同一路由段同时导出 `metadata` 与 `generateMetadata`，
 * 而详情页的标题必须跟文章走，所以这里用 generateMetadata 承担 metadata 声明。
 */

/** 卡片外壳：和 /postList 的列表卡片同一套深色样式，两页视觉一致 */
const CARD_CLASS =
  "w-full bg-[#1E2939] rounded-[32px] border-[2px] border-gray-700 px-[1.25rem] py-[1.25rem] sm:px-[2rem] sm:py-[2rem]";

/** 骨架条的呼吸动画，两处骨架屏共用 */
const SKELETON_PULSE = "animate-pulse";

/** 一篇已发布文章都没有时用的占位 id，见下面的 generateStaticParams */
const NO_ARTICLES_ID = "__no-published-articles__";

/**
 * 构建期把「已发布文章」的 id 交给 Next
 * ---------------------------------------------------------------------------
 * 列在这里的 id 会被预渲染成整页静态 HTML：正文、代码高亮、<title> 与 description
 * 全都在构建产物里（首屏最快，不执行 JS 也能读到全文）。
 *
 * 没列进来的 id 并不会 404，而是走按需渲染（见下面 <Suspense> 那段），
 * 所以「新发布一篇文章」不需要重新构建：首次访问渲染完就会被存下来。
 * 后台写入时 actions.ts 里 updateTag(ARTICLES_TAG) 会让这些静态页重新生成。
 *
 * 空数组的坑：cacheComponents 下 generateStaticParams 返回 [] 会让构建直接失败
 * （empty-generate-static-params，原因是没有样本就没法校验路由的静态壳）。
 * 一篇文章都没发布时退回一个占位 id —— 它会被页面里的 notFound() 兜成 404，
 * 不会产生任何真实可访问的页面。这是 Next 官方文档给的做法。
 */
export const generateStaticParams = async (): Promise<{ id: string }[]> => {
  // getArticles 已经带了 "use cache" + ARTICLES_TAG，这里只是复用那份缓存，不额外查库。
  // ArticleItemData.id 是 string | number（列表组件两种都收），而 params 只能是字符串，
  // 所以这里统一转一下（数据库里是 cuid，本来就是字符串）。
  const articles = await getArticles();

  return articles.length > 0
    ? articles.map((article) => ({ id: String(article.id) }))
    : [{ id: NO_ARTICLES_ID }];
};

export const generateMetadata = async ({ params }: PageProps<"/blog/[id]">): Promise<Metadata> => {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    // 命中不存在的 id：给个明确标题，并让搜索引擎不要收录这个软 404
    return { title: "文章不存在", robots: { index: false, follow: false } };
  }

  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt || undefined,
      publishedTime: article.date,
    },
  };
};

/** 整卡骨架屏：等 params 与文章数据时用，形状和真实卡片一致，加载完不跳版 */
const ArticleCardSkeleton = () => (
  <div className={`${CARD_CLASS} ${SKELETON_PULSE}`} aria-hidden>
    <span className="sr-only">正在加载文章…</span>
    <div className="h-8 w-2/3 rounded-lg bg-white/10" />
    <div className="mt-[0.75rem] h-4 w-48 rounded bg-white/5" />
    <div className="mt-[1.5rem] flex flex-col gap-[0.75rem]">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-4 rounded bg-white/5" />
      ))}
    </div>
  </div>
);

/** 正文骨架屏：正文是异步渲染的（解析 markdown + 代码高亮），单独给它一个占位 */
const ArticleBodySkeleton = () => (
  <div className="flex flex-col gap-[0.75rem]" aria-hidden>
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className={`h-4 rounded bg-white/5 ${SKELETON_PULSE}`} />
    ))}
  </div>
);

const ArticleCard = async ({ params }: Pick<PageProps<"/blog/[id]">, "params">) => {
  const { id } = await params;
  const article = await getArticleById(id);

  // 文章不存在 / 还没发布 / 已被删除：交给 app/(blog)/blog/[id]/not-found.tsx
  // （notFound() 会顺带注入 noindex；因为流式响应已经开始，HTTP 状态仍是 200）
  if (!article) notFound();

  const edited = article.updatedDate !== article.date;

  return (
    <article className={CARD_CLASS}>
      <header>
        <h1 className="text-[1.75rem] font-bold leading-snug text-[#e5eaf3] sm:text-[2rem]">
          {article.title}
        </h1>

        <div className="mt-[0.75rem] flex flex-wrap items-center gap-x-[1rem] gap-y-[0.25rem] text-[0.875rem] text-[#94a3b8]">
          <time dateTime={article.date}>{article.date}</time>
          <span>{article.authorName}</span>
          <span>约 {article.readingMinutes} 分钟读完</span>
          {edited ? <span>更新于 {article.updatedDate}</span> : null}
        </div>
      </header>

      <div className="mt-[1.5rem]">
        {/* 标题先出、正文随后补上：正文解析完 markdown 才能给（见 ArticleContent 的注释）。
            这层 Suspense 专门让「已经到手的标题/日期」先显现，不至于整张卡片陪着正文一起等 */}
        <Suspense fallback={<ArticleBodySkeleton />}>
          <ArticleContent content={article.content} />
        </Suspense>
      </div>

      <footer className="mt-[2rem] border-t border-gray-700 pt-[1rem]">
        {/* 直接输地址进来的访客没有历史记录，MainNav 的「返回」帮不上忙，这里补一个明确的去处 */}
        <Link
          href="/postList"
          className="
            inline-flex items-center text-[0.875rem] text-[#93c5fd]
            transition-colors hover:text-[#bfdbfe]
          "
        >
          ← 返回文章列表
        </Link>
      </footer>
    </article>
  );
};

const PostDetailPage = async ({ params }: PageProps<"/blog/[id]">) => {
  return (
    // h-dvh：与列表页一致，整页高度按视口算，正文长了自己滚动
    <div className="DetailContainer h-dvh">
      <div className="DetailContainer__wrapper w-full h-full max-w-[1000px] mx-auto flex flex-col p-[2rem] gap-[0.75rem]">
        <div
          className="
            DetailContainer__header
            flex
            bg-[#1E2939] rounded-[32px] border-[2px] border-gray-700
            w-fit min-w-[350px] px-[1.25rem]
          "
        >
          {/* MainNav 是客户端组件，用 usePathname() 决定高亮项与「返回」按钮，
              而 URL 数据要等请求时才有：动态路由的静态壳（构建期不知道 id 的那份）
              里它渲染不出来，cacheComponents 会直接报 CLIENT_HOOK_DYNAMIC 阻断预渲染。
              官方给的第一种解法就是包进 <Suspense>，让它随请求流式补上，
              兜底用等高的占位盒子，导航到位时下面的卡片不会被顶一下 */}
          <Suspense fallback={<MainNavPlaceholder />}>
            <MainNav />
          </Suspense>
        </div>

        {/* params 是请求时才有的数据：读它（以及读文章）的组件必须在 Suspense 里，
            这样上面的导航外壳仍然可以先静态输出 */}
        <Suspense fallback={<ArticleCardSkeleton />}>
          <ArticleCard params={params} />
        </Suspense>
      </div>
    </div>
  );
};

export default PostDetailPage;
