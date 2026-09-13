import type { Metadata } from "next";

import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

export const metadata: Metadata = {
  title: {
    default: "工作台",
    template: "%s · DouLog 后台",
  },
  description: "DouLog 博客内容管理后台",
};

/** 后台布局：左侧菜单 + 顶栏 + 多页签 */
const AdminLayout = ({ children }: LayoutProps<"/admin">) => {
  return <AdminWorkspace>{children}</AdminWorkspace>;
};

export default AdminLayout;
