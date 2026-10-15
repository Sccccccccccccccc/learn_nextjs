import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * better-auth 的 HTTP 入口：/api/auth/*
 * ---------------------------------------------------------------------------
 * ⚠️ 这个文件必须叫 route.ts —— Next.js 只认 route.ts 作为路由处理器，
 *    之前叫 router.ts 时 /api/auth/* 全是 404（客户端 signIn/signUp 直接失败）。
 *
 * 拆开写成两个具名导出，是为了让 Next 能静态识别出 GET / POST 这两个方法。
 */
const handler = toNextJsHandler(auth);

export const GET = handler.GET;
export const POST = handler.POST;
