"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { ARTICLES_TAG } from "@/lib/articles";
import { POSTS_TAG } from "./posts";

/**
 * 文章写操作（React Server Functions / Server Actions）
 * ---------------------------------------------------------------------------
 * 只在服务端执行，客户端通过表单 action 或事件回调调用。
 * 每次写入后失效两个缓存标签：
 *   - posts：后台列表 / 详情 / 统计（src/server/posts.ts）
 *   - articles：前台文章列表（src/lib/articles.ts，只查 published 的文章）
 * 两者查的是同一张表但缓存键不同，只失效一个会出现「后台更新了、前台还是旧的」。
 *
 * 鉴权说明：初始化版本还没有登录态，先以「第一位用户」作为默认作者；
 * 接入鉴权后请把 resolveAuthorId() 换成从会话中取用户，并在每个 action 里
 * 校验当前用户是否有权修改这篇文章（Server Function 可以被直接 POST 调用）。
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

/** 写入后统一失效受影响的缓存 */
const revalidatePostViews = () => {
  updateTag(POSTS_TAG);
  updateTag(ARTICLES_TAG);
};

const isNonEmpty = (value: FormDataEntryValue | null): value is string =>
  typeof value === "string" && value.trim().length > 0;

/** 取默认作者，没有用户时自动建一个占位用户 */
const resolveAuthorId = async (): Promise<string> => {
  const existing = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: { email: "admin@blog.local", name: "Admin", password: "123456" },
    select: { id: true },
  });

  return created.id;
};

const fail = (error: string): ActionResult => ({ ok: false, error });

const handleError = (scope: string, error: unknown): ActionResult => {
  console.error(`[admin] ${scope} failed:`, error);
  const message = error instanceof Error ? error.message : String(error);
  return fail(`操作失败：${message}`);
};

/** 新建文章，成功后跳转到编辑页 */
export const createPost = async (formData: FormData): Promise<ActionResult> => {
  const title = formData.get("title");
  const content = formData.get("content");

  if (!isNonEmpty(title)) return fail("标题不能为空");

  let postId: string;

  try {
    const authorId = await resolveAuthorId();
    const post = await prisma.post.create({
      data: {
        title: title.trim().slice(0, 120),
        content: typeof content === "string" ? content : "",
        published: formData.get("published") === "true",
        authorId,
      },
      select: { id: true },
    });

    postId = post.id;
  } catch (error) {
    return handleError("createPost", error);
  }

  revalidatePostViews();
  redirect(`/admin/posts/${postId}/edit?saved=created`);
};

/** 保存编辑 */
export const updatePost = async (id: string, formData: FormData): Promise<ActionResult> => {
  const title = formData.get("title");
  const content = formData.get("content");

  if (!isNonEmpty(title)) return fail("标题不能为空");

  try {
    await prisma.post.update({
      where: { id },
      data: {
        title: title.trim().slice(0, 120),
        content: typeof content === "string" ? content : "",
        published: formData.get("published") === "true",
      },
    });
  } catch (error) {
    return handleError("updatePost", error);
  }

  revalidatePostViews();
  return { ok: true };
};

/** 列表 / 编辑页的「发布 / 转草稿」开关 */
export const setPostPublished = async (id: string, published: boolean): Promise<ActionResult> => {
  try {
    await prisma.post.update({ where: { id }, data: { published } });
  } catch (error) {
    return handleError("setPostPublished", error);
  }

  revalidatePostViews();
  return { ok: true };
};

/** 删除文章 */
export const deletePost = async (id: string): Promise<ActionResult> => {
  try {
    await prisma.post.delete({ where: { id } });
  } catch (error) {
    return handleError("deletePost", error);
  }

  revalidatePostViews();
  return { ok: true };
};
