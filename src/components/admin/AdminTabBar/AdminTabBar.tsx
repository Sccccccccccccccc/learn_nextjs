"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { RefreshIcon } from "../icons";
import { resolveRouteTitle } from "../menu";
import styles from "./AdminTabBar.module.css";

type Tab = {
  /** pathname + search，作为页签唯一键 */
  href: string;
  title: string;
};

const HOME_TAB: Tab = { href: "/admin", title: "工作台" };

const buildHref = (pathname: string, search: string) => (search ? `${pathname}?${search}` : pathname);

/**
 * 多页签导航（对应 vben 的 tabbar）
 * 访问过的路由会留在页签里，关闭当前页签会回退到相邻页签。
 */
const AdminTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const href = buildHref(pathname, search);
  const status = searchParams.get("status") ?? undefined;

  const [tabs, setTabs] = useState<Tab[]>([HOME_TAB]);
  const [active, setActive] = useState<string>(HOME_TAB.href);

  /** 上一次生效的路由，用来判断「换页面了」而不是「重新渲染了」 */
  const lastHref = useRef<string | null>(null);

  useEffect(() => {
    if (lastHref.current === href) return;
    lastHref.current = href;

    if (href === HOME_TAB.href) {
      setActive(HOME_TAB.href);
      return;
    }

    const title = resolveRouteTitle(pathname, status);
    setTabs((prev) => (prev.some((tab) => tab.href === href) ? prev : [...prev, { href, title }]));
    setActive(href);
  }, [href, pathname, status]);

  const closeTab = useCallback(
    (target: Tab) => {
      setTabs((prev) => {
        const index = prev.findIndex((tab) => tab.href === target.href);
        if (index < 0) return prev;
        if (prev.length === 1) return prev;

        const next = prev.filter((tab) => tab.href !== target.href);

        if (target.href === active) {
          const fallback = next[Math.min(index, next.length - 1)] ?? HOME_TAB;
          lastHref.current = fallback.href;
          setActive(fallback.href);
          router.push(fallback.href);
        }

        return next;
      });
    },
    [active, router],
  );

  const refresh = () => {
    router.refresh();
  };

  return (
    <div className={styles.tabbar}>
      <div className={styles.tabs} role="tablist" aria-label="已打开的页面">
        {tabs.map((tab) => {
          const isActive = tab.href === active;

          return (
            <div
              key={tab.href}
              className={styles.tab}
              data-active={isActive || undefined}
              role="tab"
              aria-selected={isActive}
            >
              <button
                type="button"
                className={styles.tabButton}
                onClick={() => {
                  lastHref.current = tab.href;
                  setActive(tab.href);
                  router.push(tab.href);
                }}
              >
                <span className={styles.tabDot} />
                <span className={styles.tabLabel}>{tab.title}</span>
              </button>

              {tab.href === HOME_TAB.href ? null : (
                <button
                  type="button"
                  className={styles.tabClose}
                  onClick={() => closeTab(tab)}
                  aria-label={`关闭 ${tab.title}`}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      d="M2.4 2.4 9.6 9.6M9.6 2.4 2.4 9.6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button type="button" className={styles.refresh} onClick={refresh} aria-label="刷新当前页">
        <RefreshIcon size={15} />
      </button>
    </div>
  );
};

export default AdminTabBar;
