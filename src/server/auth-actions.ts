"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { AUTH_COOKIE, DEMO_ACCOUNT, type LoginState } from "./auth-shared";

/**
 * 登录 / 登出 Server Actions
 * ---------------------------------------------------------------------------
 * 校验顺序：先查 User 表（seed 出来的演示账号就在里面），查不到再回落到内置的
 * 演示账号常量，保证「数据库还没初始化」时也能进后台看看界面。
 *
 * ⚠️ 现在密码是明文比较的（schema 里 password 是普通 String）。接入真实鉴权时：
 *    1. 用 bcrypt/argon2 校验哈希
 *    2. 把 cookie 换成签名 / 加密的会话票据，并加过期与刷新
 *    3. 在每个 Server Action 里校验当前用户是否有权修改目标文章
 */

const verifyCredentials = async (email: string, password: string): Promise<boolean> => {
  if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) return true;

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { password: false } });
    return Boolean(user && user.password === password);
  } catch (error) {
    // 数据库不可用时不影响内置演示账号登录
    console.error("[admin] verifyCredentials failed:", error);
    return false;
  }
};

export const login = async (_prev: LoginState, formData: FormData): Promise<LoginState> => {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) return { error: "请输入邮箱" };
  if (!password) return { error: "请输入密码" };

  if (!(await verifyCredentials(email, password))) {
    return { error: "邮箱或密码不正确（演示账号见下方提示）" };
  }

  (await cookies()).set(AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
};

export const logout = async () => {
  (await cookies()).delete(AUTH_COOKIE);
  redirect("/admin/login");
};

/** 供服务端组件判断登录态（当前没有强制校验，接口先留着） */
export const isAuthenticated = async (): Promise<boolean> => {
  return (await cookies()).get(AUTH_COOKIE)?.value === "1";
};
