"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAdminSession } from "../SessionProvider";
import { useColorMode, type ColorMode } from "../useColorMode";
import { resolveBreadcrumb } from "../menu";
import {
  BellIcon,
  ChevronDownIcon,
  ExternalIcon,
  MenuIcon,
  MonitorIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  UserIcon,
} from "../icons";
import styles from "./AdminHeader.module.css";

const THEME_OPTIONS: { value: ColorMode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "亮色", icon: <SunIcon size={14} /> },
  { value: "dark", label: "暗色", icon: <MoonIcon size={14} /> },
  { value: "system", label: "系统", icon: <MonitorIcon size={14} /> },
];

const AdminHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const status = useSearchParams().get("status") ?? undefined;
  const session = useAdminSession();
  const { mode, setMode } = useColorMode();

  const [keyword, setKeyword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [menuOpen]);

  const breadcrumbs = resolveBreadcrumb(pathname, status);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = keyword.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const query = params.toString();
    router.push(query ? `/admin/posts?${query}` : "/admin/posts");
  };

  const currentTheme = THEME_OPTIONS.find((option) => option.value === mode);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.menuButton}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="切换菜单"
          aria-expanded={menuOpen}
        >
          <MenuIcon size={18} />
        </button>

        <nav className={styles.breadcrumb} aria-label="面包屑">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <span className={styles.crumb} key={`${crumb.label}-${index}`}>
                {index > 0 ? <span className={styles.crumbSep}>/</span> : null}
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className={styles.crumbLink}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={styles.crumbCurrent} aria-current={isLast ? "page" : undefined}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      <div className={styles.right}>
        <form className={styles.search} onSubmit={submitSearch} role="search">
          <SearchIcon size={15} />
          <input
            className={styles.searchInput}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索文章标题…"
            aria-label="搜索文章标题"
          />
        </form>

        <button type="button" className={styles.iconButton} onClick={() => setMode(nextMode(mode))} aria-label={`切换主题（当前：${currentTheme?.label}）`} title={`主题：${currentTheme?.label}`}>
          {currentTheme?.icon}
        </button>

        <button type="button" className={styles.iconButton} aria-label="通知" title="通知">
          <BellIcon size={17} />
          <span className={styles.dot} />
        </button>

        <div className={styles.userWrap}>
          <button
            type="button"
            className={styles.user}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className={styles.avatar}>{session.initial}</span>
            <span className={styles.userMeta}>
              <strong>{session.name}</strong>
              <small>{session.role}</small>
            </span>
            <ChevronDownIcon size={14} className={styles.userCaret} />
          </button>

          {menuOpen ? (
            <>
              <div className={styles.scrim} onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownHead}>
                  <span className={styles.avatarLarge}>{session.initial}</span>
                  <div className={styles.dropdownMeta}>
                    <strong>{session.name}</strong>
                    <small>{session.email}</small>
                  </div>
                </div>

                <div className={styles.dropdownSection}>
                  <p className={styles.dropdownTitle}>主题</p>
                  <div className={styles.themeRow}>
                    {THEME_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={styles.themeChip}
                        data-active={mode === option.value || undefined}
                        onClick={() => setMode(option.value)}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.dropdownSection}>
                  <Link href="/admin/users" className={styles.dropdownItem} role="menuitem">
                    <UserIcon size={15} />
                    <span>个人中心</span>
                  </Link>
                  <Link href="/index" className={styles.dropdownItem} role="menuitem">
                    <ExternalIcon size={15} />
                    <span>访问博客前台</span>
                  </Link>
                </div>

                <div className={styles.dropdownSection}>
                  <Link
                    href="/admin/login"
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    role="menuitem"
                  >
                    <span>退出登录</span>
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};

/** 顶栏的主题按钮：亮 → 暗 → 跟随系统 */
const nextMode = (mode: ColorMode): ColorMode =>
  mode === "light" ? "dark" : mode === "dark" ? "system" : "light";

export default AdminHeader;
