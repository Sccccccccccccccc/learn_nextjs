"use client";

import { memo, useDeferredValue } from "react";
import ReactMarkdown, { type Components } from "react-markdown";

import { REMARK_PLUGINS, REHYPE_PLUGINS } from "../markdown-config";
import styles from "./MarkdownPreview.module.css";

/**
 * Markdown 预览渲染
 * ---------------------------------------------------------------------------
 * - 输出是 React 元素，不走 dangerouslySetInnerHTML；未引入 rehype-raw，
 *   所以正文里的内联 HTML 不会被执行（默认 escaped）
 * - 外层用 useDeferredValue：打字时先让输入框保持跟手，渲染让位给下一个空闲帧
 * - 顶部工具条在「分屏」模式下显示实时字符数；单栏模式由编辑器底部统计负责
 *
 * 懒加载：由 PostForm 用 React.lazy 拆出去，只有当用户切到「分屏 / 预览」时才真正
 * import 本模块。不要改回 next/dynamic —— 它会在页面里注册预加载，实测首屏就会
 * 发出一次 Low 优先级的 chunk 请求，把 react-markdown 与 highlight.js 提前拉下来。
 */

/** 把 Markdown 里的裸链接当作外链处理 */
const LINK_COMPONENTS: Components = {
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
};

const MarkdownPreview = ({
  content,
  showToolbar = false,
  live = true,
}: {
  content: string;
  /** 是否显示预览面板自己的标题栏 */
  showToolbar?: boolean;
  /** 关闭后跳过 useDeferredValue（当前没有用到，保留给未来的服务端渲染场景） */
  live?: boolean;
}) => {
  const deferred = useDeferredValue(content);
  const value = live ? deferred : content;

  return (
    <div className={styles.previewRoot} data-stale={live && deferred !== content ? "" : undefined}>
      {showToolbar ? (
        <div className={styles.toolbar}>
          <span className={styles.toolbarDot} />
          <span className={styles.toolbarLabel}>预览</span>
          <span className={styles.toolbarMeta}>
            {value.length.toLocaleString("zh-CN")} 字符
          </span>
        </div>
      ) : null}

      <div className={styles.scroll}>
        <article className={styles.markdown}>
          {value.trim() ? (
            <ReactMarkdown
              remarkPlugins={REMARK_PLUGINS}
              rehypePlugins={REHYPE_PLUGINS}
              components={LINK_COMPONENTS}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className={styles.empty}>还没有内容，左边写点什么吧。</p>
          )}
        </article>
      </div>
    </div>
  );
};

export default memo(MarkdownPreview);
