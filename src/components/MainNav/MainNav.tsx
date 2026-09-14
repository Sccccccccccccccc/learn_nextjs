"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./MainNav.module.css";
import { BackIcon, BearIcon, PencilIcon, SettingIcon } from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

/** 暂时只放三项：我 / 文章 / 后台。以后直接往这里追加即可。 */
const NAV_ITEMS: NavItem[] = [
  { href: "/index", label: "我", icon: <BearIcon /> },
  { href: "/postList", label: "文章", icon: <PencilIcon /> },
  { href: "/admin", label: "后台", icon: <SettingIcon /> },
];

/** 需要显示「返回」的页面（对应 douLog 里由 historyState.back 控制的那个入口） */
const BACK_ROUTES = ["/postList"];

/** 动态路由没法逐条列举：文章详情 /blog/<id> 的 id 随文章变，按前缀判断 */
const BACK_PREFIXES = ["/blog/"];

const MainNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const showBack =
    BACK_ROUTES.includes(pathname) || BACK_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <nav className={styles.nav}>
      {showBack && (
        <button  
          type="button"
          className={styles.backItem}
          onClick={() => router.back()}
          aria-label="返回"
        >
          <BackIcon />
          <span>返回</span>
        </button>
      )}

      {NAV_ITEMS.map((item) => {
        // 对应 Vue 的 router-link-exact-active：完全匹配才算当前页
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={styles.menuItem}
            data-active={isActive || undefined}
            aria-current={isActive ? "page" : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MainNav;

/**
 * <MainNav /> 的占位（给 <Suspense> 当兜底）
 * ---------------------------------------------------------------------------
 * usePathname() 拿到的是「请求时才有」的 URL 数据：像 /blog/[id] 这种动态路由，
 * 构建期不知道最终 id，导航就没法进静态壳 —— cacheComponents 下会直接以
 * CLIENT_HOOK_DYNAMIC 报错阻断预渲染。官方给的第一种解法是把这类组件包进
 * <Suspense fallback={...}>，让它在请求时流式补上，于是这里提供一个占位。
 *
 * 占位沿用 .nav 的盒子（同样的 padding / 宽度），再补一行菜单项的高度，
 * 所以导航真正到位时下面的卡片不会被顶下去，也不会误触发布局抖动。
 */
export const MainNavPlaceholder = () => (
  <div className={`${styles.nav} ${styles.placeholder}`} aria-hidden />
);
