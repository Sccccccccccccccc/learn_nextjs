import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
import { UserIcon } from "@/components/admin/icons";
import "../dashboard.css";

export const metadata: Metadata = {
  title: "用户管理",
};

const UsersPage = async ({ params, searchParams }: PageProps<"/admin/users">) => {
  return (
    <PlaceholderPage
      title="用户管理"
      description="后台账号与作者信息"
      icon={<UserIcon size={26} />}
      items={[
        "账号列表（Prisma User 表已就绪，接上查询即可）",
        "密码哈希与重置（当前 password 字段是明文占位）",
        "角色与权限：超级管理员 / 编辑 / 作者",
        "个人资料与头像上传",
      ]}
    />
  );
};

export default UsersPage;
