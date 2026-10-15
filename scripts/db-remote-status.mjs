/**
 * 临时脚本：只读检查线上数据库（Prisma Postgres）的表结构
 * 连接串从 .env.production.local 的 PRISMA_DATABASE_URL / POSTGRES_URL 读取
 */
import { readFileSync } from "node:fs";

import pg from "pg";

const url = (() => {
  if (process.env.REMOTE_DATABASE_URL) return process.env.REMOTE_DATABASE_URL;

  const text = readFileSync(".env.production.local", "utf8");
  const line = text
    .split(/\r?\n/)
    .find((row) => row.startsWith("PRISMA_DATABASE_URL") || row.startsWith("POSTGRES_URL"));

  if (!line) throw new Error("没有找到线上连接串");

  return line.split("=").slice(1).join("=").trim().replace(/^"|"$/g, "");
})();

const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 20000 });

const main = async () => {
  await client.connect();
  const host = new URL(url.replace(/^postgres(ql)?:/, "http:")).host;
  console.log(`已连接：${host}\n`);

  const tables = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by 1"
  );
  console.log("现有表：", tables.rows.map((r) => r.table_name).join(", ") || "(空库)");

  if (tables.rows.length === 0) {
    console.log("\n→ 线上库是空的，跑 prisma migrate deploy 就能建好全部表。");
    return;
  }

  const mig = await client
    .query("select migration_name, finished_at from _prisma_migrations order by started_at")
    .catch(() => ({ rows: [], missing: true }));

  if (mig.missing) {
    console.log("\n_migrations 表不存在 → 没有 Prisma 迁移历史");
  } else {
    console.log("\n迁移历史：");
    for (const m of mig.rows) console.log(`  ${m.migration_name} -> ${m.finished_at}`);
  }

  for (const { table_name } of tables.rows) {
    if (table_name === "_prisma_migrations") continue;
    const count = await client.query(`select count(*)::int as n from "${table_name}"`);
    console.log(`  ${table_name}: ${count.rows[0].n} 行`);
  }
};

main()
  .catch((error) => {
    console.error("检查失败：", error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
