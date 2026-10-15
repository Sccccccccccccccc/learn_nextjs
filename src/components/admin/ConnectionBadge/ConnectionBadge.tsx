import { connection } from "next/server";

import { getDatabaseHealth } from "@/server/posts";
import styles from "./ConnectionBadge.module.css";
import { AlertIcon, ShieldIcon } from "../icons";
import { formatCompact } from "../format";

/**
 * 数据库连接状态徽标（服务端组件）
 * 页面用 <Suspense> 包住它，探活期间先显示静态壳，不阻塞首屏。
 * 延迟是「这次请求的实测值」，所以放在 connection() 之后计时，
 * 不写进缓存函数里——否则 prerender 阶段会因为 Date.now() 报错。
 */
const ConnectionBadge = async () => {
  await connection();
  const startedAt = Date.now();
  const health = await getDatabaseHealth();
  const latency = Date.now() - startedAt;

  return (
    <span className={styles.badge} data-ok={health.ok || undefined} title={`PostgreSQL · ${latency}ms`}>
      {health.ok ? <ShieldIcon size={13} /> : <AlertIcon size={13} />}
      <span className={styles.dot} />
      {health.ok ? (
        <>
          <span>数据库已连接{ process.env.ENV_CONSTANT }</span>
          <span className={styles.sep}>·</span>
          <span>{formatCompact(health.posts)} 篇</span>
        </>
      ) : (
        <span>数据库未连接</span>
      )}
      <span className={styles.latency}>{latency}ms</span>
    </span>
  );
};

export default ConnectionBadge;
