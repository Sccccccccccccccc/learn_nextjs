"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyPassword } from "better-auth/crypto";

import prisma from "@/lib/prisma";
import { AUTH_COOKIE, DEMO_ACCOUNT, type LoginState } from "./auth-shared";

/**
 * 登录 / 登出 Server Actions
 * ---------------------------------------------------------------------------
 * 校验顺序：先查数据库里的 credential 账号，查不到再回落到内置的演示账号常量，
 * 保证「数据库还没初始化」时也能进后台看看界面。
 *
 * ⚠️ 密码比对已经改成 better-auth 那一套：哈希存在 account.password
 *    （providerId = "credential"，accountId = user.id），经 scrypt(salt:key) 存储，
 *    校验也必须用 better-auth 自己的 verifyPassword，不能自己 hand-roll。
 *    user 表里没有 password 列 —— 这是 better-auth 的核心表结构决定的。
 *
 * 注意：页面上真正在用的登录/注册是 better-auth 客户端（src/lib/auth-client.ts
 * 的 signIn.email / signUp.email，见 LoginForm）；这个 Server Action 是早期
 * 演示版登录，留着给「数据库没起来」的兜底场景。
 */

const verifyCredentials = async (email: string, password: string): Promise<boolean> => {
  if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) return true;

  try {
    // 密码哈希在 account 表上，不在 user 表上
    const account = await prisma.account.findFirst({
      where: { providerId: "credential", user: { email } },
      select: { password: true },
    });

    if (!account?.password) return false;

    // 与 better-auth 客户端登录走同一套 scrypt 校验
    return await verifyPassword({ hash: account.password, password });
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
