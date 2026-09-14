import type { Options as RehypeHighlightOptions } from "rehype-highlight";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";

/**
 * Markdown 渲染配置（后台预览与前台详情页共用）
 * ---------------------------------------------------------------------------
 * 刻意不引入 `rehype-raw`：它会把正文里的内联 HTML 真正解析执行，一旦开放投稿
 * 就是存储型 XSS 的现成入口。react-markdown 默认输出 React 元素、不经过
 * dangerouslySetInnerHTML，保持这个默认值最安全。
 *
 * 代码高亮：rehype-highlight v7（highlight.js 11）
 *   - 默认注册 highlight.js 的 common 语言集
 *   - `detect: true` 让没写语言的代码块也能猜（配合 subset 限定猜测范围）
 *   - `subset` 只影响**自动识别**的范围：显式写了 ```rust 之类的代码块，
 *     只要语言已注册就照常高亮，不受 subset 限制
 *   - 未知语言默认不会抛错，只是不高亮
 *
 * 类型说明：这里只从 `unified` / `rehype-highlight` 引入 **类型**，值仍然只有
 * remark-gfm 与 rehype-highlight 两个插件，所以本模块被 PostForm 静态引入时
 * 不会把渲染器本体带进首屏 chunk（真正的渲染器在 PostForm 里用 React.lazy 拆出去）。
 *
 * 为什么没有 "use client"：这份配置现在有两个消费者 ——
 *   - 后台预览 MarkdownPreview（客户端组件，import 进来即进客户端 chunk）
 *   - 前台详情 ArticleContent（服务端组件，用 react-markdown 的 MarkdownAsync 渲染，
 *     正文直接出现在服务端产出的 HTML 里，前台一个字节的 markdown 运行时都不用下载）
 * 指令本身不带任何副作用（本模块无 hooks / JSX），去掉它才能让服务端组件拿到
 * 真正的插件数组而不是客户端引用；插件清单只此一份，前后台不会各写一套慢慢跑偏。
 */

/** 自动识别时优先尝试的语言：博客里最常见的一批 */
const DETECT_SUBSET = [
  "bash",
  "css",
  "diff",
  "go",
  "java",
  "javascript",
  "json",
  "markdown",
  "python",
  "rust",
  "sql",
  "typescript",
  "xml",
  "yaml",
];

const HIGHLIGHT_OPTIONS: RehypeHighlightOptions = {
  detect: true,
  subset: DETECT_SUBSET,
};

export const REHYPE_PLUGINS: PluggableList = [[rehypeHighlight, HIGHLIGHT_OPTIONS]];

export const REMARK_PLUGINS: PluggableList = [
  // GFM：表格、任务列表、删除线、自动链接
  remarkGfm,
];
