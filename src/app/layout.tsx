import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "My App",
};

/** 根布局：只负责 <html>/<body> 与全局样式、主题初始化脚本 */
const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <script
          // 首屏前落地主题，避免暗色用户看到一闪而过的白底
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('admin-color-mode')||'system';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=m==='system'?(d?'dark':'light'):m;document.documentElement.dataset.theme=t;document.documentElement.dataset.colorMode=m;document.documentElement.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
