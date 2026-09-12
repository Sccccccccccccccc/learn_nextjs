import type { Metadata } from "next";

import PlaceholderPage from "@/components/admin/PlaceholderPage";
import { TrendIcon } from "@/components/admin/icons";
import "../dashboard.css";

export const metadata: Metadata = {
  title: "数据分析",
};

const AnalyticsPage = async ({ params, searchParams }: PageProps<"/admin/analytics">) => {
  return (
    <PlaceholderPage
      title="数据分析"
      description="阅读量、来源与内容表现"
      icon={<TrendIcon size={26} />}
      items={[
        "文章阅读量 / 点赞 / 评论统计（需要新增埋点表）",
        "按标签与时间的分布图",
        "热门文章 Top 10 与转化漏斗",
        "导出 CSV 报表",
      ]}
    />
  );
};

export default AnalyticsPage;
