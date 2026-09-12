import type { Metadata } from "next";

import PlaceholderPage from "@/components/admin/PlaceholderPage";
import { SettingsIcon } from "@/components/admin/icons";
import "../dashboard.css";

export const metadata: Metadata = {
  title: "系统设置",
};

const SettingsPage = async ({ params, searchParams }: PageProps<"/admin/settings">) => {
  return (
    <PlaceholderPage
      title="系统设置"
      description="站点信息、主题与偏好"
      icon={<SettingsIcon size={26} />}
      items={[
        "站点名称 / Logo / 备案信息",
        "主题色与暗色模式默认值（目前主题偏好存在浏览器本地）",
        "评论开关、审核策略",
        "数据库备份与导出",
      ]}
    />
  );
};

export default SettingsPage;
