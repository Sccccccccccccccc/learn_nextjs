/**
 * 初始化数据（seed）
 * ---------------------------------------------------------------------------
 * 运行：npx prisma db seed     （等价于 node prisma/seed.mjs）
 *
 * 做两件事：
 *   1. 创建演示账号 admin@blog.local / admin123
 *   2. 创建 3 篇示例文章，让列表 / 筛选 / 仪表盘一上手就有内容
 *
 * 只想建账号、不要示例文章：  SEED_SAMPLE_POSTS=0 npx prisma db seed
 *
 * 关于演示账号 —— 必须写成 better-auth 认得的形状，否则登录会「查不到账号」：
 *   - user  ：id / name / email / emailVerified，name 与 email 都是 NOT NULL
 *   - account：providerId = "credential"，accountId = user.id（不是邮箱！），
 *              password = better-auth 自己的 scrypt 哈希（salt:key 格式）
 *   这套对应关系来自 better-auth 的注册与登录实现：
 *     dist/api/routes/sign-up.mjs  → linkAccount({ accountId: createdUser.id, password: hash })
 *     dist/api/routes/sign-in.mjs  → 按 providerId === "credential" && accountId === user.id 查到该行
 *   所以密码绝不能再明文入库，也绝不能再往 user 表塞 password 列。
 *
 * 说明：这里用 pg 直连而不是 Prisma Client —— 生成的客户端带有无扩展名的
 * 相对导入（如 ./enums），Node 的 ESM 解析器跑不动。要改用 Prisma Client 的话，
 * 装一个 tsx 并把本文件改名为 seed.ts、seed 命令改成 `tsx prisma/seed.ts` 即可。
 * ---------------------------------------------------------------------------
 */
import { readFileSync } from "node:fs";

import { hashPassword } from "better-auth/crypto";
import pg from "pg";

const DEMO_EMAIL = "admin@blog.local";
const DEMO_PASSWORD = "admin123";
const DEMO_NAME = "Admin";

/** 连接串优先取环境变量，其次读 .env（seed 由 prisma CLI 触发时不会自动加载） */
const resolveDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const line = readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .find((row) => row.startsWith("DATABASE_URL"));

  if (!line) throw new Error("没有找到 DATABASE_URL，请检查 .env");

  return line
    .split("=")
    .slice(1)
    .join("=")
    .trim()
    .replace(/^"|"$/g, "");
};

const SAMPLES = [
  {
    title: "Next.js 16 的 Cache Components 到底解决了什么",
    content:
      "## 从「全动态」到「默认静态壳」\n\n" +
      "开启 cacheComponents 之后，数据获取默认是动态的，是否缓存由你在页面、组件或函数级别显式决定。\n\n" +
      "- `use cache` 缓存不随请求变化的计算\n" +
      "- `<Suspense>` 让请求时才有的数据流式补齐\n" +
      "- 静态壳 + 流式内容 = PPR（部分预渲染）\n\n" +
      "```ts\nasync function Posts() {\n  'use cache'\n  cacheLife('hours')\n  return db.post.findMany()\n}\n```\n",
    published: true,
  },
  {
    title: "Element Plus 色板 + vben 布局的搭配笔记",
    content:
      "## 分工\n\n" +
      "色板直接对齐 Element Plus 的 theme-chalk 变量，布局尺寸参考 vben-admin 的 design tokens：\n\n" +
      "| 变量 | 用途 |\n| --- | --- |\n| `--primary` | #409eff 主色 |\n| `--bg-page` | 主体区域底色 |\n| `--layout-sidebar-width` | 侧边栏宽度 232px |\n\n" +
      "好处是改一个变量就能整体换肤；暗色模式只需要覆盖 `:root[data-theme='dark']` 里的同名变量。\n",
    published: true,
  },
  {
    title: "Prisma 7 的 driver adapter 迁移记录（草稿）",
    content:
      "## 为什么需要 adapter\n\n" +
      "Prisma 7 使用 query compiler 客户端，必须显式传入 driver adapter：\n\n" +
      "```ts\nconst adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })\nexport const prisma = new PrismaClient({ adapter })\n```\n\n" +
      "这篇还没写完，先存草稿。\n",
    published: false,
  },
];

/**
 * 生成主键。
 * better-auth 自己也会生成 id，但这是裸 SQL 直连，绕过它的适配器，
 * 所以 user / account / post 的 id 都得自己给（列上没有 DEFAULT）。
 */
const newId = () =>
  `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}${Math.random()
    .toString(36)
    .slice(2, 10)}`;

const client = new pg.Client({ connectionString: resolveDatabaseUrl() });

/** 建（或补齐）演示账号：user 一行 + credential 一行，返回 user.id */
const ensureDemoAccount = async () => {
  // 幂等：邮箱已存在就只更新显示名，不动 id（id 被 session/account/post 引用着）
  const user = await client.query(
    `insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
     values ($1, $2, $3, true, now(), now())
     on conflict (email) do update set name = excluded.name, "updatedAt" = now()
     returning id`,
    [newId(), DEMO_NAME, DEMO_EMAIL],
  );

  const userId = user.rows[0].id;
  const password = await hashPassword(DEMO_PASSWORD);

  // account 表在 (providerId, accountId) 上没有唯一约束，所以「先查再写」
  const existing = await client.query(
    `select id from "account" where "providerId" = 'credential' and "accountId" = $1`,
    [userId],
  );

  if (existing.rowCount > 0) {
    // 已注册过（比如在登录页点过注册）就只把密码重置回演示密码，保证能登进去
    await client.query(`update "account" set password = $1, "updatedAt" = now() where id = $2`, [
      password,
      existing.rows[0].id,
    ]);
  } else {
    await client.query(
      `insert into "account"
         (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       values ($1, $2, 'credential', $2, $3, now(), now())`,
      [newId(), userId, password],
    );
  }

  console.log(`✓ 演示账号就绪：${DEMO_EMAIL} / ${DEMO_PASSWORD}（密码已按 better-auth 的 scrypt 哈希入库）`);

  return userId;
};

const ensureSamplePosts = async (adminId) => {
  if (process.env.SEED_SAMPLE_POSTS === "0") {
    console.log("· 已跳过示例文章（SEED_SAMPLE_POSTS=0）");
    return;
  }

  const existing = await client.query('select count(*)::int as count from "post" where "authorId" = $1', [
    adminId,
  ]);

  if (existing.rows[0].count > 0) {
    console.log(`· 该作者已有 ${existing.rows[0].count} 篇文章，跳过示例数据`);
    return;
  }

  let index = 0;
  for (const sample of SAMPLES) {
    index += 1;
    await client.query(
      `insert into "post" (id, title, content, published, "authorId", "createdAt", "updatedAt")
       values ($1, $2, $3, $4, $5, now() - ($6 || ' hours')::interval, now() - ($7 || ' hours')::interval)`,
      [newId(), sample.title, sample.content, sample.published, adminId, String(index * 26), String(index * 5)],
    );
  }

  console.log(`✓ 已写入 ${SAMPLES.length} 篇示例文章（2 篇已发布 / 1 篇草稿）`);
};

try {
  await client.connect();

  const adminId = await ensureDemoAccount();
  await ensureSamplePosts(adminId);
} catch (error) {
  console.error("seed 失败：", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
