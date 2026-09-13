"use client";

import { Suspense } from "react";
import type { ReactNode } from "react";

import { AdminHeader } from "../AdminHeader";
import { AdminSidebar } from "../AdminSidebar";
import { AdminTabBar } from "../AdminTabBar";
import { AdminSessionProvider, type AdminSession } from "../SessionProvider";
import styles from "./AdminWorkspace.module.css";

/**
 * 后台外壳：左侧菜单 + 顶栏 + 多页签 + 内容区
 * 结构对照 vben-admin 的 basic layout（sidebar / header / tabbar / content）。
 *
 * 关于 <Suspense>：菜单与顶栏会读 URL 上的 ?status= 来决定选中项，
 * 在 Cache Components 下这类「只在请求时才有的数据」必须放在 Suspense 边界内，
 * 否则打包时会报 blocking-prerender-client-hook。这里统一收口到骨架层，
 * 页面组件就不用各自处理了。
 */
const AdminSidebarFallback = () => (
  <div className={`${styles.sidebarSkeleton} ${styles.sidebar}`} aria-hidden="true">
    <div className={styles.brandSkeleton} />
    <div className={styles.menuSkeleton}>
      {[68, 52, 52, 46, 60, 44, 44].map((width, index) => (
        <div key={index} className={styles.itemSkeleton} style={{ width: `${width}%` }} />
      ))}
    </div>
  </div>
);

const AdminHeaderFallback = () => (
  <div className={styles.headerSkeleton} aria-hidden="true">
    <div className={styles.crumbSkeleton} />
    <div className={styles.actionsSkeleton} />
  </div>
);

const AdminWorkspace = ({
  session,
  children,
}: {
  session?: AdminSession;
  children: ReactNode;
}) => {
  return (
    <AdminSessionProvider session={session}>
      <div className={styles.layout}>
        <Suspense fallback={<AdminSidebarFallback />}>
          <AdminSidebar />
        </Suspense>

        <div className={styles.main}>
          <Suspense fallback={<AdminHeaderFallback />}>
            <AdminHeader />
          </Suspense>

          <Suspense fallback={<div className={styles.tabbarFallback} />}>
            <AdminTabBar />
          </Suspense>

          <main className={styles.content}>
            <div className={styles.contentInner}>{children}</div>
          </main>
        </div>
      </div>
    </AdminSessionProvider>
  );
};

export default AdminWorkspace;
