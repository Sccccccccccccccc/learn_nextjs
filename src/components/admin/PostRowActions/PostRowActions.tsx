"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { deletePost } from "@/server/actions";
import styles from "./PostRowActions.module.css";

/**
 * 列表行的操作区：编辑 / 删除
 * 删除走两步确认（对应 element-plus 的 el-popconfirm），避免误删。
 */
const PostRowActions = ({
  id,
  title,
  redirectAfterDelete,
}: {
  id: string;
  title: string;
  /** 删除后要跳转的路径，例如编辑页删除后回列表 */
  redirectAfterDelete?: string;
}) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!confirming) return;

    const timer = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  const remove = () => {
    startTransition(async () => {
      const result = await deletePost(id);

      if (!result.ok) {
        setError(result.error);
        setConfirming(false);
        return;
      }

      if (redirectAfterDelete) router.replace(redirectAfterDelete);
      router.refresh();
    });
  };

  if (error) {
    return (
      <span className={styles.error} title={error}>
        删除失败
      </span>
    );
  }

  return (
    <span className={styles.actions}>
      <button
        type="button"
        className={`admin-btn admin-btn--text admin-btn--sm`}
        onClick={() => router.push(`/admin/posts/${id}/edit`)}
        disabled={pending}
      >
        编辑
      </button>

      {confirming ? (
        <span className={styles.confirm}>
          <span className={styles.confirmText}>删除「{title.slice(0, 12)}」？</span>
          <button
            type="button"
            className={`admin-btn admin-btn--danger admin-btn--sm`}
            onClick={remove}
            disabled={pending}
          >
            {pending ? "删除中" : "确认"}
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn--text admin-btn--sm`}
            onClick={() => setConfirming(false)}
            disabled={pending}
          >
            取消
          </button>
        </span>
      ) : (
        <button
          type="button"
          className={`admin-btn admin-btn--text admin-btn--sm admin-btn--danger`}
          onClick={() => setConfirming(true)}
          disabled={pending}
        >
          删除
        </button>
      )}
    </span>
  );
};

export default PostRowActions;
