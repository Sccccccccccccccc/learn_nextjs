This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 后台管理（admin 分支）

内容管理后台，色系取自 Element Plus 的 theme-chalk 色板，布局参考 vben-admin 的 basic layout
（侧边菜单 / 顶栏 / 多页签 / 内容区）。

### 路由

| 路径 | 说明 |
| --- | --- |
| `/admin` | 工作台：文章数、字数、今日更新、近 7 天趋势、最近文章 |
| `/admin/posts` | 文章管理：状态筛选、标题搜索、排序、分页、批量发布、行内删除 |
| `/admin/posts/new` | 写文章（发布 / 存草稿），支持 Markdown 实时预览 |
| `/admin/posts/[id]/edit` | 编辑文章（带元数据侧栏与删除入口，含 Markdown 预览） |
| `/admin/analytics` `/admin/users` `/admin/settings` | 占位页，规划中的模块 |
| `/admin/login` | 登录页（演示账号 `admin@blog.local` / `admin123`） |

博客前台 `/index`、`/postList` 的悬浮菜单里新增了「后台」入口。

### Markdown 预览

编辑器提供「编辑 / 分屏 / 预览」三种视图，渲染链路：

| 环节 | 选型 |
| --- | --- |
| 渲染 | `react-markdown`（输出 React 元素，不走 `dangerouslySetInnerHTML`） |
| 语法扩展 | `remark-gfm`（表格、任务列表、删除线、自动链接） |
| 代码高亮 | `rehype-highlight` + highlight.js 11（common 语言集） |

几个刻意的取舍：

- **不引入 `rehype-raw`**：它会把正文里的内联 HTML 真正解析执行，一旦开放投稿就是存储型 XSS 入口
- **不挂官方主题 CSS**：`MarkdownPreview.module.css` 里按 highlight.js 的 github / github-dark
  主题逐值复刻了 token 配色，这样配色跟着 `tokens.css` 的亮暗切换走，不用维护两份主题文件
- **预览只在切到分屏/预览时挂载**：`next/dynamic` 会在首屏就预加载目标 chunk（实测），
  所以这里用普通 import + 条件挂载，react-markdown 与 highlight.js 自然留在独立 chunk 里
- **`useDeferredValue` + `memo`**：打字时输入框优先，预览让位到下一个空闲帧，并短暂降透明度提示

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
src/components/admin/MarkdownPreview.tsx    # Markdown 渲染（懒加载 chunk）
src/components/admin/markdown-config.ts     # remark / rehype 插件与高亮配置
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
- 编辑器还没有工具栏（加粗/链接/代码块按钮）、自动保存、标签 / slug 字段
- 前台 `/postList` 还没接 Markdown 渲染（目前只读数据库，正文未展示）

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
