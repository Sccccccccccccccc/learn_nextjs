/**
 * 清空本地数据库（开发用，会删掉 public schema 下的所有表与数据）
 * 运行：node scripts/db-reset.mjs
 *
 * 与 `prisma migrate reset` 的区别：这个脚本连 public schema 一起 DROP 掉，
 * 连历史遗留的表（例如此前没有 @@map 的 "Post"）、类型、_prisma_migrations 记录
 * 都会一并清除，适合「表结构推倒重来」的场景。
 */
import pg from "pg";
import "dotenv/config";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

const main = async () => {
  await client.connect();

  const before = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by 1"
  );
  console.log("将被删除的表：", before.rows.map((r) => r.table_name).join(", ") || "(无)");

  await client.query("drop schema public cascade");
  await client.query("create schema public");

  const after = await client.query(
    "select count(*)::int as n from information_schema.tables where table_schema = 'public'"
  );
  console.log(`✓ public schema 已重建，剩余表数量：${after.rows[0].n}`);
};

main()
  .catch((error) => {
    console.error("重置失败：", error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
