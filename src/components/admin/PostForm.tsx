"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, lazy, useState, useMemo, useTransition } from "react";

import { countWords, formatDateTime } from "./format";
import { AlertIcon, ChevronLeftIcon, DocumentIcon, ExternalIcon } from "./icons";
import type { ActionResult } from "@/server/actions";
import styles from "./PostForm.module.css";

/**
 * Markdown 渲染器用 React.lazy 拆出去
 * next/dynamic 会在页面里注册预加载，实测首屏 28ms 就发了一次 Low 优先级请求，
 * 等于把 320KB 的渲染器（react-markdown + highlight.js）提前拉下来。
 * React.lazy 只在组件真正首次渲染时才触发 import，不写文章预览就不会下载。
 */
const MarkdownPreview = lazy(() => import("./MarkdownPreview"));

type SaveAction = (formData: FormData) => Promise<ActionResult>;

export type PostFormValues = {
  title: string;
  content: string;
  published: boolean;
};

/** 编辑区视图：纯编辑 / 左写右预览 / 纯预览 */
type ViewMode = "edit" | "split" | "preview";

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "edit", label: "编辑" },
  { value: "split", label: "分屏" },
  { value: "preview", label: "预览" },
];

/** 渲染器 chunk 下载期间的占位（通常只有几十毫秒） */
const PreviewSkeleton = () => (
  <div className={styles.previewSkeleton} aria-hidden="true">
    <div className={styles.previewSkeletonBlock} style={{ width: "46%", height: 18 }} />
    <div className={styles.previewSkeletonBlock} style={{ width: "92%" }} />
    <div className={styles.previewSkeletonBlock} style={{ width: "86%" }} />
    <div className={styles.previewSkeletonBlock} style={{ width: "70%" }} />
    <div className={styles.previewSkeletonBlock} style={{ width: "100%", height: 96 }} />
  </div>
);

/**
 * 文章编辑表单
 * 左侧正文（编辑 / 分屏 / 预览三种视图）+ 右侧信息栏（状态、操作、元数据），
 * 保存走 Server Action。
 * 预览组件只在切到「分屏 / 预览」时才挂载，react-markdown 与 highlight.js
 * 因此留在独立 chunk 里，写文章时不下载。
 */
const PostForm = ({
  mode,
  action,
  initial,
  saved,
  meta,
}: {
  mode: "create" | "edit";
  action: SaveAction;
  initial: PostFormValues;
  /** 上一次操作的结果提示（URL 上的 ?saved=） */
  saved?: "created" | "updated" | null;
  meta?: {
    id: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  };
}) => {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [published, setPublished] = useState(initial.published);
  const [view, setView] = useState<ViewMode>("edit");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    saved === "created" ? "文章已创建" : saved === "updated" ? "保存成功" : null,
  );
  const [pending, startTransition] = useTransition();

  const words = useMemo(() => countWords(content), [content]);
  const paragraphs = useMemo(
    () => content.split(/\n{2,}/).filter((block) => block.trim()).length,
    [content],
  );

  /** 提交：nextPublished 为本次要写入的发布状态 */
  const submit = (nextPublished: boolean) => {
    setError(null);
    setNotice(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);
    formData.set("published", nextPublished ? "true" : "false");

    startTransition(async () => {
      const result = await action(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setPublished(nextPublished);
      setNotice(nextPublished ? "已发布" : "已保存为草稿");
      router.refresh();
    });
  };

  const isEdit = mode === "edit";

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        submit(published);
      }}
    >
      <div className={styles.main}>
        <section className={`admin-card ${styles.editor}`}>
          <div className={styles.editorHead}>
            <input
              className={styles.titleInput}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="请输入文章标题…"
              maxLength={120}
              aria-label="文章标题"
              autoFocus={!isEdit}
            />
            <span className={styles.titleCount}>{title.length}/120</span>
          </div>

          <div className={styles.viewBar}>
            <div className={styles.viewSwitch} role="tablist" aria-label="编辑区视图">
              {VIEW_MODES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={view === item.value}
                  className={styles.viewChip}
                  data-active={view === item.value || undefined}
                  onClick={() => setView(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <span className={styles.viewHint}>
              {view === "preview"
                ? "预览为只读视图，切回「编辑」继续写"
                : "支持 GFM：表格、任务列表、删除线、围栏代码块"}
            </span>
          </div>

          <div className={styles.editorBody} data-view={view}>
            {view !== "preview" ? (
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={"在这里写正文，支持 Markdown 语法。\n\n## 二级标题\n- 列表项\n- [x] 已完成的任务\n\n| 列 A | 列 B |\n| --- | --- |\n| 1 | 2 |\n\n```ts\nconst hello = 'world'\n```"}
                aria-label="文章正文"
                spellCheck={false}
              />
            ) : null}

            {view !== "edit" ? (
              <div className={styles.previewPane}>
                <Suspense fallback={<PreviewSkeleton />}>
                  <MarkdownPreview content={content} showToolbar={view === "split"} />
                </Suspense>
              </div>
            ) : null}
          </div>

          <div className={styles.editorFoot}>
            <span>字数 {words.toLocaleString("zh-CN")}</span>
            <span>字符 {content.length.toLocaleString("zh-CN")}</span>
            <span>段落 {paragraphs.toLocaleString("zh-CN")}</span>
            <span className={styles.markdownHint}>代码高亮：highlight.js（common 语言集）</span>
          </div>
        </section>
      </div>

      <aside className={styles.side}>
        <section className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">发布</h2>
            <span className={`admin-tag ${published ? "admin-tag--success" : "admin-tag--info"}`}>
              <span className="admin-tag__dot" />
              {published ? "已发布" : "草稿"}
            </span>
          </div>

          <div className={styles.sideBody}>
            {error ? (
              <p className={styles.error}>
                <AlertIcon size={14} />
                {error}
              </p>
            ) : null}

            {notice && !error ? <p className={styles.notice}>{notice}</p> : null}

            <div className={styles.sideActions}>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => submit(true)}
                disabled={pending}
              >
                {pending ? "保存中…" : "发布"}
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() => submit(false)}
                disabled={pending}
              >
                存为草稿
              </button>
            </div>

            <div className={styles.sideActions}>
              <Link className="admin-btn admin-btn--text" href="/admin/posts">
                <ChevronLeftIcon size={14} />
                返回列表
              </Link>
              <Link className="admin-btn admin-btn--text" href="/index">
                <ExternalIcon size={14} />
                看前台
              </Link>
            </div>

            <p className={styles.tip}>
              提示：发布状态由按钮决定，点「发布」即对前台可见，点「存为草稿」会先藏起来。
            </p>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">文章信息</h2>
            <DocumentIcon size={16} style={{ color: "var(--text-placeholder)" }} />
          </div>
          <div className={styles.sideBody}>
            <dl className={styles.metaList}>
              <div>
                <dt>ID</dt>
                <dd className={styles.mono}>{meta?.id ?? "保存后生成"}</dd>
              </div>
              <div>
                <dt>作者 ID</dt>
                <dd className={styles.mono}>{meta?.authorId ?? "当前默认作者"}</dd>
              </div>
              <div>
                <dt>创建时间</dt>
                <dd>{meta ? formatDateTime(meta.createdAt) : "—"}</dd>
              </div>
              <div>
                <dt>更新时间</dt>
                <dd>{meta ? formatDateTime(meta.updatedAt) : "—"}</dd>
              </div>
            </dl>
          </div>
        </section>
      </aside>
    </form>
  );
};

export default PostForm;
