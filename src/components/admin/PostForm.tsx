"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { countWords, formatDateTime } from "./format";
import { AlertIcon, ChevronLeftIcon, DocumentIcon, ExternalIcon } from "./icons";
import type { ActionResult } from "@/server/actions";
import styles from "./PostForm.module.css";

type SaveAction = (formData: FormData) => Promise<ActionResult>;

export type PostFormValues = {
  title: string;
  content: string;
  published: boolean;
};

/**
 * 文章编辑表单
 * 左侧正文 + 右侧信息栏（状态、操作、元数据），保存走 Server Action。
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
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    saved === "created" ? "文章已创建" : saved === "updated" ? "保存成功" : null,
  );
  const [pending, startTransition] = useTransition();

  const words = useMemo(() => countWords(content), [content]);

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

          <textarea
            className={styles.textarea}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={"在这里写正文，支持 Markdown 语法。\n\n## 二级标题\n- 列表项\n```ts\nconst hello = 'world'\n```"}
            aria-label="文章正文"
            spellCheck={false}
          />

          <div className={styles.editorFoot}>
            <span>字数 {words.toLocaleString("zh-CN")}</span>
            <span>字符 {content.length.toLocaleString("zh-CN")}</span>
            <span>段落 {content.split(/\n{2,}/).filter((block) => block.trim()).length}</span>
            <span className={styles.markdownHint}>Markdown 预览将在下一版接入</span>
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
