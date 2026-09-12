import type { ReactNode } from "react";

import {
  AlertIcon,
  CirclePlusIcon,
  DocumentIcon,
  HomeIcon,
  LinkIcon,
  SettingsIcon,
  TrendIcon,
  UserIcon,
} from "./icons";

export type AdminMenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
  /** 菜单选中判定：exact = pathname 完全相等；query = pathname + 指定查询参数相等 */
  match: "exact" | "prefix" | "query";
  /** match === 'query' 时参与比对的参数名 */
  queryKey?: string;
  /** match === 'query' 时参与比对的参数值 */
  queryValue?: string;
  /** 需要排除的 pathname（例如「文章管理」不该在「写文章」页高亮） */
  exclude?: string[];
  badge?: string;
  external?: boolean;
};

export type AdminMenuGroup = {
  title?: string;
  items: AdminMenuItem[];
};

const ICON_SIZE = 16;

/** 侧边菜单：结构对齐 vben 的 menu 配置，这里写成静态常量 */
export const ADMIN_MENU: AdminMenuGroup[] = [
  {
    items: [
      {
        label: "工作台",
        href: "/admin",
        icon: <HomeIcon size={ICON_SIZE} />,
        match: "exact",
      },
    ],
  },
  {
    title: "内容管理",
    items: [
      {
        label: "文章管理",
        href: "/admin/posts",
        icon: <DocumentIcon size={ICON_SIZE} />,
        match: "query",
        queryKey: "status",
        exclude: ["/admin/posts/new"],
      },
      {
        label: "写文章",
        href: "/admin/posts/new",
        icon: <CirclePlusIcon size={ICON_SIZE} />,
        match: "exact",
      },
      {
        label: "草稿箱",
        href: "/admin/posts?status=draft",
        icon: <AlertIcon size={ICON_SIZE} />,
        match: "query",
        queryKey: "status",
        queryValue: "draft",
      },
      {
        label: "数据分析",
        href: "/admin/analytics",
        icon: <TrendIcon size={ICON_SIZE} />,
        match: "prefix",
      },
    ],
  },
  {
    title: "站点",
    items: [
      {
        label: "访问博客",
        href: "/index",
        icon: <LinkIcon size={ICON_SIZE} />,
        match: "exact",
        external: true,
      },
    ],
  },
  {
    title: "系统",
    items: [
      {
        label: "用户管理",
        href: "/admin/users",
        icon: <UserIcon size={ICON_SIZE} />,
        match: "prefix",
        badge: "待开发",
      },
      {
        label: "系统设置",
        href: "/admin/settings",
        icon: <SettingsIcon size={ICON_SIZE} />,
        match: "prefix",
        badge: "待开发",
      },
    ],
  },
];

/** 路由 → 标题（面包屑与多页签共用） */
export const ADMIN_ROUTE_TITLES: Record<string, string> = {
  "/admin": "工作台",
  "/admin/posts": "文章管理",
  "/admin/posts/new": "写文章",
  "/admin/analytics": "数据分析",
  "/admin/users": "用户管理",
  "/admin/settings": "系统设置",
  "/admin/login": "登录",
};

const POST_STATUS_LABELS: Record<string, string> = {
  draft: "草稿箱",
  published: "已发布",
};

/** 给 pathname（+ 查询参数）取一个展示标题 */
export const resolveRouteTitle = (pathname: string, status?: string): string => {
  if (pathname === "/admin/posts" && status && POST_STATUS_LABELS[status]) {
    return POST_STATUS_LABELS[status];
  }

  if (pathname.endsWith("/edit")) return "编辑文章";

  return ADMIN_ROUTE_TITLES[pathname] ?? "页面";
};

export type AdminBreadcrumb = {
  label: string;
  href?: string;
};

/** pathname → 面包屑（后台层级固定，用规则表即可，动态段在页面内补充） */
export const resolveBreadcrumb = (pathname: string, status?: string): AdminBreadcrumb[] => {
  if (pathname === "/admin") return [{ label: "工作台" }];

  const crumbs: AdminBreadcrumb[] = [{ label: "工作台", href: "/admin" }];

  if (pathname.startsWith("/admin/posts")) {
    crumbs.push({ label: "内容管理" });

    if (pathname === "/admin/posts") {
      crumbs.push({ label: "文章管理" });
      if (status && POST_STATUS_LABELS[status]) crumbs.push({ label: POST_STATUS_LABELS[status] });
      return crumbs;
    }

    crumbs.push({ label: "文章管理", href: "/admin/posts" });
    crumbs.push({ label: pathname === "/admin/posts/new" ? "写文章" : "编辑文章" });
    return crumbs;
  }

  const title = ADMIN_ROUTE_TITLES[pathname];
  crumbs.push({ label: title ?? "未知页面" });

  return crumbs;
};

/** 当前菜单项是否选中 */
export const isMenuItemActive = (
  item: AdminMenuItem,
  pathname: string,
  status?: string,
): boolean => {
  if (item.exclude?.includes(pathname)) return false;

  switch (item.match) {
    case "exact":
      return pathname === item.href;
    case "prefix":
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    case "query":
      return (
        pathname === item.href.split("?")[0] &&
        (status ?? "") === (item.queryValue ?? "")
      );
    default:
      return false;
  }
};

export const SettingsMenuIcon = <SettingsIcon size={16} />;
