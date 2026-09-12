This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 后台管理（admin 分支）

内容管理后台，色系取自 Element Plus 的 theme-chalk 色板，布局参考 vben-admin 的 basic layout
（侧边菜单 / 顶栏 / 多页签 / 内容区）。

### 路由

| 路径 | 说明 |
| --- | --- |
| `/admin` | 工作台：文章数、字数、今日更新、近 7 天趋势、最近文章 |
| `/admin/posts` | 文章管理：状态筛选、标题搜索、排序、分页、批量发布、行内删除 |
| `/admin/posts/new` | 写文章（发布 / 存草稿） |
| `/admin/posts/[id]/edit` | 编辑文章（带元数据侧栏与删除入口） |
| `/admin/analytics` `/admin/users` `/admin/settings` | 占位页，规划中的模块 |
| `/admin/login` | 登录页（演示账号 `admin@blog.local` / `admin123`） |

博客前台 `/index`、`/postList` 的悬浮菜单里新增了「后台」入口。

### 初始化数据

```bash
npx prisma db seed                  # 建演示账号 + 3 篇示例文章
SEED_SAMPLE_POSTS=0 npx prisma db seed   # 只建演示账号
```

### 代码结构

```
src/app/admin/                 # 后台页面（layout + 各路由 page）
src/app/(admin-auth)/          # 登录页单独成组，不套后台外壳
src/components/admin/          # 侧边栏 / 顶栏 / 多页签 / 表格 / 表单 / 图标
src/server/posts.ts            # 读取层：带 use cache + cacheTag('posts')
src/server/actions.ts          # 写操作 Server Actions（增删改 + 发布）
src/server/auth-actions.ts     # 登录 / 登出
src/app/tokens.css             # Element Plus 色阶 + vben 布局变量（亮/暗两套）
```

> 缓存约定：列表读取带 `use cache`，写操作后调用 `updateTag('posts')` 立即失效；
> 工作台因为要显示「今日更新 / 几小时前」，用 `connection()` 明确走请求时渲染。
> 任何读取 `searchParams` / `params` / `cookies` 的组件都放在 `<Suspense>` 边界内，
> 否则开启 `cacheComponents` 后整条路由无法预渲染。

### 还没做的部分

- 登录只是写了个 cookie，没有真正的会话与权限校验（Server Action 可被直接 POST 调用，务必补上）
- `User.password` 仍是明文，需要换成 bcrypt/argon2 哈希
- 正文编辑器还没有 Markdown 预览、自动保存、标签 / slug 字段

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
