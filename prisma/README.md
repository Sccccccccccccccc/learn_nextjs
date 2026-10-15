# 数据库表结构与变更流程

> **改表之前先看这里。** 本文只讲三件事：表结构长什么样、怎么改、怎么同步到线上。
> 业务代码的说明在根目录 `README.md`。

数据库是 PostgreSQL。本地跑在 `localhost:5432/blogdb`，线上是 Prisma Postgres（`db.prisma.io`），
两者**结构必须一致**，靠 `prisma/migrations` 里的迁移文件保证。

---

## 一、当前表结构

五张表：四张是 better-auth 的核心表，一张是博客业务表。

| 表名 | 来源 | 说明 |
| --- | --- | --- |
| `user` | better-auth | 用户。**没有 password 列** |
| `session` | better-auth | 会话，cookie 里存的是 `token` |
| `account` | better-auth | 登录方式。邮箱密码的哈希在 `password` 列 |
| `verification` | better-auth | 邮箱验证 / 重置密码等一次性凭证 |
| `post` | 业务 | 博客文章，`authorId` → `user.id` 级联删除 |

完整字段定义看 `prisma/schema.prisma`（文件头部有「为什么这么设计」的注释）。

### 要点

- **`user.name` 和 `user.email` 都是 NOT NULL**。better-auth core 里这两个字段是 required，
  早期版本写成 `name String?` 是错的。
- **密码哈希在 `account.password`，不在 `user` 上**。登录方式是
  `providerId = 'credential'` + `accountId = user.id`（注意是 user.id，不是邮箱！），
  值形如 `salt:key` 的 scrypt 哈希。
- **better-auth 那四张表的主键 `id` 都没有 `@default()`**。id 由 better-auth 自己生成
  （32 位随机串），所以用 `prisma.user.create()` 裸建用户时**必须自己传 id**
  （见 `src/server/actions.ts` 用 `randomUUID()`）。
  业务表 `post.id` 不一样，用的是 `@default(cuid())`，由 Prisma 侧生成。
- **表名统一小写**（`@@map`），字段名统一 camelCase。better-auth 默认的 `fieldName`
  就是 camelCase，它不会帮你映射 snake_case。
- 索引只有 better-auth 声明的这些，没有多余的：
  `user_email_key`、`session_token_key`、`session_userId_idx`、`account_userId_idx`、
  `verification_identifier_idx`，加上业务表的 `post_authorId_idx`。

### 权威来源（别照官网文档抄）

官网文档给的 schema 版本不一定和你装的包一致。以**本机安装的包的运行时导出**为准：

```bash
node scripts/dump-auth-schema.mjs      # 打印当前 auth 配置下的权威表结构
```

背后的定义在 `node_modules/@better-auth/core/dist/db/get-tables.mjs` 的 `buildAuthTables()`。
核对我们用的是 better-auth **1.7.6**。

---

## 二、改表流程（标准动作）

### 1. 改 schema

编辑 `prisma/schema.prisma`。

> ⚠️ 改 better-auth 那四张表时，要同时改 `src/lib/auth.ts` 的配置（比如加字段要配
> `user.additionalFields`），否则运行时和表结构会再次脱节。**只改表不改配置，或者反过来，
> 都会在登录时报「列不存在 / 参数无效」。**

### 2. 本地生成并应用迁移

```bash
npx prisma migrate dev --name 描述性名字
```

这条命令会：对比 schema 与本地库 → 生成 `prisma/migrations/<时间戳>_<名字>/migration.sql`
→ 应用到本地库 → 自动重新生成 Prisma Client。

- **迁移名用英文短语**，会进文件名和线上历史，比如 `add_post_tags`、`add_user_bio`。
- 如果它提示要 reset 数据库（出现 drift），先看后面「危险操作」那一节。
- **改完必须重启 `next dev`**：跑着的 dev server 内存里还是旧 Prisma Client，
  会继续报 `The table public.xxx does not exist`（见「踩过的坑速查」第 1 条）。

### 3. 本地验证

```bash
node scripts/db-verify.mjs     # 表 / 外键 / 索引 / 演示账号密码哈希
node scripts/auth-e2e.mjs      # 真实注册 + 登录 + 会话（需要 dev server 在 3000 端口）
```

如果你加的是 better-auth 相关字段，**光看表结构不够**，一定要跑 `auth-e2e.mjs` 走一遍真实登录。

### 4. 提交并推送 —— 线上自动迁移

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: xxx"
git push
```

Vercel 的构建命令是：

```
prisma generate && prisma migrate deploy && next build
```

所以**只要迁移文件跟着代码一起推上去，线上库会在构建时自动升级**，不需要手动碰生产库。
（`prisma migrate deploy` 只应用已有迁移，不会生成新的、也不会 reset，线上用它是安全的。）

### 5. 只想改线上库、不想等部署

```powershell
# PowerShell
$env:DATABASE_URL = '<线上连接串>'
npm run db:deploy          # 等价于 npx prisma migrate deploy
```

或者用 `scripts/db-remote-status.mjs` 先看一眼线上现状再决定。

---

## 三、常用命令速查

| 目的 | 命令 |
| --- | --- |
| 改表 + 生成迁移（本地） | `npx prisma migrate dev --name <名字>` |
| 只应用已有迁移（线上/CI） | `npx prisma migrate deploy` |
| 看迁移状态（本地是否有 drift、线上有没有未应用） | `npx prisma migrate status` |
| 重新生成 Prisma Client | `npx prisma generate` |
| 灌初始化数据 | `npx prisma db seed` |
| 只建演示账号、不要示例文章 | PowerShell：`$env:SEED_SAMPLE_POSTS=0; npx prisma db seed` |
| 打印 better-auth 权威表结构 | `node scripts/dump-auth-schema.mjs` |
| 校验本地库结构 | `node scripts/db-verify.mjs` |
| 查看**线上**库状态（只读） | `node scripts/db-remote-status.mjs`<br>连接串取 `.env.production.local` 的 `PRISMA_DATABASE_URL`（没有的话先 `npx vercel link` + `npx vercel env pull`），也可用 `REMOTE_DATABASE_URL` 环境变量覆盖 |
| 端到端验证登录链路 | `node scripts/auth-e2e.mjs` |
| 清空本地库（**危险**） | `node scripts/db-reset.mjs` |

> Prisma 7 的 schema 位置和 seed 命令都写在根目录 `prisma7.config.ts` 里，
> 它还会 `import "dotenv/config"` 读 `.env`。

---

## 四、环境与线上库

| 环境 | 连接串来源 |
| --- | --- |
| 本地 | `.env` 的 `DATABASE_URL` → `localhost:5432/blogdb` |
| 线上 | Vercel 平台变量 `DATABASE_URL` → `db.prisma.io` |

### Vercel 环境变量清单

| 名称 | 环境 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | Production, Preview | Prisma 集成注入，生产库连接串 |
| `PRISMA_DATABASE_URL` / `POSTGRES_URL` | Production, Preview | Prisma 集成注入，同上 |
| `BETTER_AUTH_SECRET` | Production, Preview | 32 字节随机（`openssl rand -base64 32`） |
| `BETTER_AUTH_URL` | Production | `https://learnnextjs-cyan.vercel.app`。Preview 故意不设，让它从请求推导（预览域名每次都变） |
| `ENV_CONSTANT` | Production | 只给后台顶栏那个连接徽标显示用 |

### 为什么 `.vercelignore` 要排除 `.env`

**Vercel CLI 的默认忽略清单里只有 `.env.local` 和 `.env.*.local`，不包含 `.env`。**
不排除的话，本地 `.env` 会被打进部署包，生产环境会悄悄读到本地的值 —— 之前就因此
在生产用了那个 16 位弱 `BETTER_AUTH_SECRET`（better-auth 在构建日志里警告过低熵）。

判断是否排除成功：构建日志里**不该**再出现 `- Environments: .env` 这一行。

所以：**往 `.env` 里加变量对线上无效**，线上变量必须用
`npx vercel env add <NAME> production` 配置。

---

## 五、踩过的坑速查

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `The table public.Post does not exist`（注意大写 P） | 跑着的 dev server 还持有旧 Prisma Client | 重启 `next dev` |
| `The table public.post does not exist` | 线上库没迁移 | 让 `migrate deploy` 跑一次（push 或手动 `npm run db:deploy`） |
| Vercel 构建在 `Collecting page data` 失败，报表不存在 | 构建期要预渲染 `/blog/[id]`，必须能连库且表已建好 | 迁移放进 build 脚本后已解决 |
| `Argument name is missing` / `name` 不能为空 | `user.name` 是 NOT NULL，旧代码按可空写 | 创建用户时补上 `name` |
| `Argument id is missing` | auth 表的 id 没有默认值，由 better-auth 生成 | 裸建时自己传 `randomUUID()` |
| seed 报 `column "password" of relation "User" does not exist` | 往 `user` 表插密码列了 | 密码写 `account.password`，且用 `hashPassword()` 哈希 |
| `/api/auth/*` 全部 404 | 处理文件名必须叫 `route.ts` | 见 `src/app/api/auth/[...all]/route.ts` |
| 登录报 403 / INVALID_ORIGIN | `BETTER_AUTH_URL` 和实际访问域名不一致 | 对齐变量与实际域名（本地要写 `http://localhost:3000`） |
| 担心 `prisma migrate deploy` 放 Vercel 构建里会不会挂 | 不会。Prisma 7 的迁移执行已不依赖原生 schema-engine（实测把 `schema-engine-windows.exe` 移走后仍能成功 deploy），npm 拦 `@prisma/engines` 的 postinstall 也不影响 | 可以放心放在 build 里 |

---

## 六、危险操作

### `node scripts/db-reset.mjs`

`DROP SCHEMA public CASCADE` 再重建 —— 表、数据、`_prisma_migrations` 全没。
用于「表结构推倒重来」。**对线上库执行等于删掉全部用户和文章。**

### 什么时候需要「推倒重来」

只有当本地迁移历史和线上**分叉**且无法调和时（比如本地删过 `prisma/migrations` 目录）。
正确姿势是**两边一起重建**，而不是只重建一边：

```powershell
# 1. 本地
node scripts/db-reset.mjs
npx prisma migrate deploy
npx prisma db seed

# 2. 线上（换连接串）
$env:DATABASE_URL = '<线上连接串>'
node scripts/db-reset.mjs
npx prisma migrate deploy
```

> 现在本地和线上都只有一条 baseline 迁移 `20261015174724_init`，历史是一致的。
> **别再随手删 `prisma/migrations` 目录** —— 删了就又要重建两边。

### 线上库已经手工建好表、但 `_prisma_migrations` 里没记录

不要用 `db push` 硬推，用 resolve 把该迁移标记为已应用：

```bash
npx prisma migrate resolve --applied <迁移目录名>
```

---

## 七、当前迁移历史

| 迁移 | 内容 |
| --- | --- |
| `20261015174724_init` | baseline：better-auth 四张核心表 + `post`；本地与线上（`db.prisma.io`）都只有这一条 |

`prisma/migrations/migration_lock.toml` 里 `provider = "postgresql"`，**不要手改这个文件**。
