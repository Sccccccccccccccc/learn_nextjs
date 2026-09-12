/**
 * 登录相关的常量与类型
 * 单独放一个普通模块：`"use server"` 文件只允许导出 async 函数，
 * 常量放在那里会被编译器拒绝，客户端组件也没法安全地引用。
 */

export const AUTH_COOKIE = "doulog_admin";

export type LoginState = { error?: string };

/** 初始化版本的演示账号，接入真实用户表后删掉即可 */
export const DEMO_ACCOUNT = {
  email: "admin@blog.local",
  password: "admin123",
} as const;
