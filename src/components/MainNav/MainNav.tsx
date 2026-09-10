"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./MainNav.module.css";
import { BearIcon, PencilIcon } from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

/** 暂时只放两项：我 / 文章。以后直接往这里追加即可。 */
const NAV_ITEMS: NavItem[] = [
  { href: "/index", label: "我", icon: <BearIcon /> },
  { href: "/postList", label: "文章", icon: <PencilIcon /> },
];

const MainNav = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
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
