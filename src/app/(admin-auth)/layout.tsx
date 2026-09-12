import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 · DouLog 后台",
};

/** 认证页布局：不套后台的侧边栏与多页签，整屏居中 */
const AdminAuthLayout = ({ children }: LayoutProps<"/admin">) => {
  return <>{children}</>;
};

export default AdminAuthLayout;