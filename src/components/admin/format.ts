/** 后台页面共用的展示格式化工具（纯函数，服务端/客户端都能用） */

const pad = (value: number) => String(value).padStart(2, "0");

/** 2026-02-18 14:05 */
export const formatDateTime = (value: Date | string): string => {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

/** 3 分钟前 / 2 天前 */
export const formatRelative = (value: Date | string): string => {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  const diff = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "刚刚";
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`;

  return formatDateTime(date).slice(0, 10);
};

/** 中文按字符数、英文按单词数粗略统计字数 */
export const countWords = (content: string | null | undefined): number => {
  if (!content) return 0;

  const text = content.trim();
  if (!text) return 0;

  const cjk = text.match(/[\u4e00-\u9fa5\u3040-\u30ff]/g)?.length ?? 0;
  const words = text
    .replace(/[\u4e00-\u9fa5\u3040-\u30ff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return cjk + words;
};

/** cuid 太长，列表里只展示尾部 6 位（类似 GitHub 的 short sha） */
export const shortId = (id: string): string => (id.length > 6 ? id.slice(-6) : id);

/** 把 markdown 正文压成一句摘要 */
export const toExcerpt = (content: string | null | undefined, max = 96): string => {
  if (!content) return "";

  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
};

/** 大数字缩写：12800 → 1.28 万 */
export const formatCompact = (value: number): string => {
  if (value < 10_000) return String(value);
  return `${(value / 10_000).toFixed(2)} 万`;
};
