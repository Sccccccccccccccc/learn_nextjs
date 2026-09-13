"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ADMIN_MENU, isMenuItemActive } from "../menu";
import { ExternalIcon, LogoIcon } from "../icons";
import styles from "./AdminSidebar.module.css";

const AdminSidebar = () => {
  const pathname = usePathname();
  const status = useSearchParams().get("status") ?? undefined;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>
          <LogoIcon size={20} />
        </span>
        <span className={styles.brandText}>
          <strong>DouLog</strong>
          <small>内容管理后台</small>
        </span>
      </div>

      <nav className={styles.menu} aria-label="后台导航">
        {ADMIN_MENU.map((group, groupIndex) => (
          <div className={styles.group} key={group.title ?? `group-${groupIndex}`}>
            {group.title ? <p className={styles.groupTitle}>{group.title}</p> : null}

            <ul className={styles.groupList}>
              {group.items.map((item) => {
                const active = isMenuItemActive(item, pathname, status);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={styles.item}
                      data-active={active || undefined}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className={styles.itemIcon}>{item.icon}</span>
                      <span className={styles.itemLabel}>{item.label}</span>
                      {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
                      {item.external ? (
                        <span className={styles.external}>
                          <ExternalIcon size={12} />
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <span className={styles.version}>v0.1.0 · 初始化版本</span>
      </div>
    </aside>
  );
};

export default AdminSidebar;
