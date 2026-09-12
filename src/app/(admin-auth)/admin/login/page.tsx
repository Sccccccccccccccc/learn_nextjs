import type { Metadata } from "next";

import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "登录",
};

const LoginPage = async ({ params, searchParams }: PageProps<"/admin/login">) => {
  return <LoginForm />;
};

export default LoginPage;
