/**
 * 端到端校验：better-auth 接口 + 新的 postgres 表结构是否真的能用
 * 运行：node scripts/auth-e2e.mjs       （需要 `npm run dev` 正在 3000 端口跑）
 *
 * 覆盖 5 个点：
 *   1. /api/auth/get-session 可访问（验证 route.ts 存在、better-auth 挂载成功）
 *   2. 注册新用户 → 会往 user / account / session 三张表写入
 *   3. 拿注册返回的 cookie 读会话 → 验证 session 表读路径
 *   4. 用 seed 的演示账号登录 → 验证 account.password 的 scrypt 哈希能被校验通过
 *   5. 错误密码必须被拒
 * 结束后会删掉本次注册的临时用户（连带 account / session 级联删除）。
 *
 * ⚠️ 改完 schema 后必须先重启 dev server，否则它还在用旧的 Prisma client，
 *    会报 `The table public.Post does not exist`。
 */
import pg from "pg";
import "dotenv/config";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const TEST_EMAIL = `e2e-${Date.now()}@blog.local`;
const TEST_PASSWORD = "e2e-password-123";

let failed = 0;

const check = (label, ok, detail = "") => {
  if (!ok) failed += 1;
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` —— ${detail}` : ""}`);
};

const post = (path, body, headers = {}) =>
  fetch(BASE + path, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE, ...headers },
    body: JSON.stringify(body),
  });

const main = async () => {
  const reachable = await fetch(BASE + "/api/auth/get-session").catch(() => null);
  if (!reachable) throw new Error(`连不上 ${BASE}，先启动 npm run dev`);
  check("better-auth 入口可达 /api/auth/get-session", reachable.status === 200, `status=${reachable.status}`);

  // 注册：会写 user + account + session
  const signUp = await post("/api/auth/sign-up/email", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    name: "E2E User",
  });
  const signUpBody = await signUp.json().catch(() => ({}));
  check("注册写入 user/account/session", signUp.status === 200 && !!signUpBody?.user?.id, JSON.stringify(signUpBody).slice(0, 200));

  const cookie = signUp.headers.getSetCookie?.().map((c) => c.split(";")[0]).join("; ") ?? "";
  check("注册返回了会话 cookie", cookie.length > 0);

  if (cookie) {
    const session = await fetch(BASE + "/api/auth/get-session", { headers: { cookie } });
    const body = await session.json().catch(() => null);
    check("带 cookie 能读回会话（session 表读路径）", body?.user?.email === TEST_EMAIL, JSON.stringify(body).slice(0, 200));
  }

  // 演示账号登录：验证 seed 写进去的 scrypt 哈希
  const signIn = await post("/api/auth/sign-in/email", { email: "admin@blog.local", password: "admin123" });
  const signInBody = await signIn.json().catch(() => ({}));
  check("seed 演示账号可登录", signIn.status === 200 && !!signInBody?.user?.id, JSON.stringify(signInBody).slice(0, 200));

  const bad = await post("/api/auth/sign-in/email", { email: "admin@blog.local", password: "wrong" });
  check("错误密码被拒", bad.status >= 400, `status=${bad.status}`);

  // 清理临时用户（account / session 是 onDelete: Cascade，自动跟着删）
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const removed = await client.query('delete from "user" where email = $1 returning id', [TEST_EMAIL]);
  await client.end();
  console.log(`· 已清理临时用户 ${TEST_EMAIL}（${removed.rowCount} 行）`);

  console.log(failed === 0 ? "\n全部通过 ✓" : `\n有 ${failed} 项未通过 ✗`);
  process.exitCode = failed === 0 ? 0 : 1;
};

main().catch((error) => {
  console.error("校验失败：", error.message);
  process.exitCode = 1;
});
