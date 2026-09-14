import { MarkdownAsync, type Components } from "react-markdown";

import { REHYPE_PLUGINS, REMARK_PLUGINS } from "@/components/admin/markdown-config";

import styles from "./ArticleContent.module.css";

/**
 * 文章正文渲染（Markdown -> HTML）
 * ---------------------------------------------------------------------------
 * 用 react-markdown v10 的 `MarkdownAsync`：它是个 async 组件，专为服务端渲染准备。
 * 和后台预览用的 `Markdown`（内部是 useState + useEffect，只能待在客户端）不同，
 * 这里正文在服务端就变成了 HTML —— 前台读者不必为「渲染 markdown」下载
 * react-markdown / unified / highlight.js 任何一坨 JS，也不会出现水合之后
 * 正文再被客户端重渲染一遍的情况。
 *
 * 插件清单来自 markdown-config：与后台预览共用同一份（含「不引入 rehype-raw」这条
 * XSS 底线），避免前后台两套渲染结果不一致。
 *
 * 排版样式的底色是列表/详情页那张 #1E2939 深色卡片，所以本模块自带一套暗色 prose，
 * 不复用后台预览的 MarkdownPreview.module.css（那套跟随 tokens.css 的亮暗主题，
 * 放到常暗的卡片上会出现浅底代码块）。
 */

/** 正文里的链接一律按外链处理：新标签打开，避免读者顺着链接离开后回不来 */
const LINK_COMPONENTS: Components = {
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
};

type Props = {
  /** 原始 markdown 正文 */
  content: string;
};

const ArticleContent = async ({ content }: Props) => {
  const value = content.trim();

  if (!value) {
    return <p className={styles.empty}>这篇文章还没有正文。</p>;
  }

  // 这里直接 await，而不是把 <MarkdownAsync>…</MarkdownAsync> 当子元素渲染：
  // 后者在 React 眼里是一个「还没兑现的 async 组件」，会再开一段流式任务去补，
  // 正文容易变成分几次 flush 逐步冒出来。await 完再交出结果，正文一次到齐，
  // 加载态交给 page.tsx 里包住本组件的 <Suspense> 骨架屏。
  const body = await MarkdownAsync({
    remarkPlugins: REMARK_PLUGINS,
    rehypePlugins: REHYPE_PLUGINS,
    components: LINK_COMPONENTS,
    children: value,
  });

  return <div className={styles.article}>{body}</div>;
};

export default ArticleContent;
