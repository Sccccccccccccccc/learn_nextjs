import Link from "next/link";
import type { ReactNode } from "react";

import { SparkIcon } from "./icons";

/** 「待开发」占位卡片：把还没实现的入口留出位置，点进来不至于 404 */
const PlaceholderPage = ({
  title,
  description,
  icon,
  items,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  items: string[];
}) => (
  <>
    <div className="admin-page-head">
      <div>
        <h1 className="admin-page-head__title">{title}</h1>
        <p className="admin-page-head__desc">{description}</p>
      </div>
      <div className="admin-page-head__actions">
        <Link className="admin-btn" href="/admin">
          回到工作台
        </Link>
      </div>
    </div>

    <section className="admin-card">
      <div className="admin-empty">
        <span className="admin-empty__icon">{icon}</span>
        <p className="admin-empty__title">这个模块还在规划中</p>
        <p className="admin-empty__text">
          当前版本先把内容管理打通，下面这些是接下来要补的能力：
        </p>
        <ul className="admin-todo" style={{ textAlign: "left", marginTop: 8 }}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <span className="admin-tag admin-tag--warning" style={{ marginTop: 12 }}>
          <SparkIcon size={12} />
          待开发
        </span>
      </div>
    </section>
  </>
);

export default PlaceholderPage;
