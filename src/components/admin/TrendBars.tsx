import styles from "./TrendBars.module.css";
import { TrendIcon } from "./icons";

/** 迷你趋势柱状图（纯 CSS，服务端组件即可） */
const TrendBars = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(1, ...data.map((item) => item.value));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="admin-card">
      <div className="admin-card__header">
        <div>
          <h2 className="admin-card__title">近 7 天新增</h2>
          <p className="admin-card__desc">共 {total} 篇新文章</p>
        </div>
        <TrendIcon size={18} style={{ color: "var(--text-placeholder)" }} />
      </div>

      <div className="admin-card__body">
        <div className={styles.chart} role="img" aria-label={`近 7 天新增文章，共 ${total} 篇`}>
          {data.map((item) => (
            <div className={styles.column} key={item.label}>
              <span className={styles.value}>{item.value}</span>
              <div className={styles.track}>
                <div
                  className={styles.bar}
                  style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }}
                />
              </div>
              <span className={styles.label}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendBars;
