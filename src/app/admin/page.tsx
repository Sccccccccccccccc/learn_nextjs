import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ConnectionBadge } from "@/components/admin/ConnectionBadge";
import { PostRowActions } from "@/components/admin/PostRowActions";
import { PostStatusTag } from "@/components/admin/PostStatusTag";
import { TrendBars } from "@/components/admin/TrendBars";
import {
  AlertIcon,
  CirclePlusIcon,
  DocumentIcon,
  InboxIcon,
  PencilIcon,
  SparkIcon,
  TrendIcon,
  UserIcon,
} from "@/components/admin/icons";
import { formatCompact, formatRelative, shortId } from "@/components/admin/format";
import { getDashboardStats, getRecentPostsForDashboard } from "@/server/posts";
import { DashboardSkeleton, TableSkeleton } from "@/app/admin/skeletons";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "工作台",
};

type StatCard = {
  label: string;
  value: string;
  foot: React.ReactNode;
  tone: "primary" | "success" | "warning" | "info";
  icon: React.ReactNode;
};

/** 统计卡片区：数据来自带缓存的 getDashboardStats() */
const StatsSection = async () => {
  const stats = await getDashboardStats();

  const cards: StatCard[] = [
    {
      label: "文章总数",
      value: formatCompact(stats.total),
      tone: "primary",
      icon: <DocumentIcon size={17} />,
      foot: (
        <>
          已发布 <b>{stats.published}</b> · 草稿 {stats.draft}
        </>
      ),
    },
    {
      label: "累计字数",
      value: formatCompact(stats.words),
      tone: "success",
      icon: <PencilIcon size={17} />,
      foot:
        stats.total > 0
          ? `平均每篇 ${Math.round(stats.words / stats.total).toLocaleString("zh-CN")} 字`
          : "还没有内容",
    },
    {
      label: "今日更新",
      value: String(stats.updatedToday),
      tone: "warning",
      icon: <TrendIcon size={17} />,
      foot: "今天被创建或修改过的文章数",
    },
    {
      label: "注册用户",
      value: String(stats.totalUsers),
      tone: "info",
      icon: <UserIcon size={17} />,
      foot: "Prisma User 表记录数",
    },
  ];

  return (
    <>
      {stats.error ? (
        <div className="admin-alert">
          <AlertIcon size={16} />
          <span>{stats.error}</span>
        </div>
      ) : null}

      <div className="admin-grid-4">
        {cards.map((card) => (
          <article className="admin-card admin-stat" key={card.label}>
            <div className="admin-stat__top">
              <span className="admin-stat__label">{card.label}</span>
              <span className="admin-stat__icon" data-tone={card.tone}>
                {card.icon}
              </span>
            </div>
            <p className="admin-stat__value">{card.value}</p>
            <p className="admin-stat__foot">{card.foot}</p>
          </article>
        ))}
      </div>

      <div className="admin-grid-2">
        <TrendBars data={stats.trend} />

        <section className="admin-card">
          <div className="admin-card__header">
            <div>
              <h2 className="admin-card__title">初始化待办</h2>
              <p className="admin-card__desc">当前版本的边界与下一步</p>
            </div>
            <SparkIcon size={18} style={{ color: "var(--text-placeholder)" }} />
          </div>
          <div className="admin-card__body">
            <ul className="admin-todo">
              <li>
                接入登录鉴权 <span>（现在以首位用户作为默认作者）</span>
              </li>
              <li>
                Post 增加 slug / 摘要 / 标签字段 <span>（需要迁移）</span>
              </li>
              <li>
                正文支持 Markdown 实时预览 <span>（编辑页已留好位置）</span>
              </li>
              <li>列表增加批量操作与回收站</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
};

/** 最近文章表格（请求时渲染：要显示「几小时前」这类相对时间） */
const RecentPosts = async () => {
  const { items, error } = await getRecentPostsForDashboard(5);

  return (
    <section className="admin-card">
      <div className="admin-card__header">
        <div>
          <h2 className="admin-card__title">最近文章</h2>
          <p className="admin-card__desc">按更新时间倒序，最多展示 5 篇</p>
        </div>
        <Link className="admin-btn admin-btn--text" href="/admin/posts">
          查看全部 →
        </Link>
      </div>

      {error ? (
        <div className="admin-card__body">
          <div className="admin-alert">
            <AlertIcon size={16} />
            <span>{error}</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__icon">
            <InboxIcon size={26} />
          </span>
          <p className="admin-empty__title">还没有文章</p>
          <p className="admin-empty__text">
            数据库里一条 Post 记录都没有，点右上角「写文章」创建第一篇吧。
          </p>
          <Link
            className="admin-btn admin-btn--primary"
            href="/admin/posts/new"
            style={{ marginTop: 8 }}
          >
            <CirclePlusIcon size={14} />
            写文章
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>状态</th>
                <th>作者</th>
                <th>字数</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="admin-post-cell">
                      <Link className="admin-post-cell__title" href={`/admin/posts/${post.id}/edit`}>
                        {post.title}
                      </Link>
                      <span className="admin-table__mono">#{shortId(post.id)}</span>
                    </div>
                  </td>
                  <td>
                    <PostStatusTag published={post.published} />
                  </td>
                  <td>{post.authorName}</td>
                  <td>{post.words.toLocaleString("zh-CN")}</td>
                  <td>{formatRelative(post.updatedAt)}</td>
                  <td>
                    <PostRowActions id={post.id} title={post.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const DashboardPage = async ({ params, searchParams }: PageProps<"/admin">) => {
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-head__title">工作台</h1>
          <p className="admin-page-head__desc">内容概览、最近动态与初始化进度</p>
        </div>
        <div className="admin-page-head__actions">
          <Suspense fallback={null}>
            <ConnectionBadge />
          </Suspense>
          <Link className="admin-btn" href="/admin">
            刷新
          </Link>
          <Link className="admin-btn admin-btn--primary" href="/admin/posts/new">
            <CirclePlusIcon size={14} />
            写文章
          </Link>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={3} />}>
        <RecentPosts />
      </Suspense>
    </>
  );
};

export default DashboardPage;
