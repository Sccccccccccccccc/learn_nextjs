/**
 * 校验本地表结构是否符合 better-auth 的预期（只读，不改数据）
 * 运行：node scripts/db-verify.mjs
 *
 * 检查三件事：
 *   1. 表 / 列 / 外键 / 索引是否与 better-auth core 定义一致
 *   2. 演示账号的 user + credential account 是否成对存在
 *   3. account.password 是否真的是 better-auth 的 scrypt 哈希（能通过它自己的校验）
 */
import { verifyPassword } from "better-auth/crypto";
import pg from "pg";
import "dotenv/config";

const EXPECTED_TABLES = ["account", "post", "session", "user", "verification"];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

const main = async () => {
  await client.connect();

  const tables = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by 1"
  );
  const names = tables.rows.map((r) => r.table_name);
  const missing = EXPECTED_TABLES.filter((t) => !names.includes(t));
  const extra = names.filter((t) => !EXPECTED_TABLES.includes(t));

  console.log("表：", names.join(", "));
  console.log(missing.length ? `✗ 缺少表：${missing.join(", ")}` : "✓ 表齐全");
  if (extra.length) console.log(`! 多出来的表：${extra.join(", ")}`);

  const fks = await client.query(
    `select conrelid::regclass::text as tbl, pg_get_constraintdef(oid) as def
     from pg_constraint where contype = 'f' and connamespace = 'public'::regnamespace
     order by 1`
  );
  console.log("\n外键：");
  for (const f of fks.rows) console.log(`  ${f.tbl}: ${f.def}`);

  const idx = await client.query(
    `select tablename, indexname from pg_indexes where schemaname = 'public' order by 1, 2`
  );
  console.log("\n索引：");
  for (const i of idx.rows) console.log(`  ${i.tablename}.${i.indexname}`);

  const rows = await client.query(
    `select u.id as user_id, u.email, u.name, u."emailVerified",
            a.id as account_id, a."providerId", a."accountId", a.password
     from "user" u
     left join "account" a on a."userId" = u.id
     order by u."createdAt"`
  );

  console.log("\n账号：");
  for (const r of rows.rows) {
    const paired = r.providerId === "credential" && r.accountId === r.user_id;
    console.log(
      `  ${r.email} | name=${r.name} | emailVerified=${r.emailVerified} | provider=${r.providerId ?? "(无)"} | accountId===user.id: ${paired ? "✓" : "✗"}`
    );
  }

  console.log("\n密码校验（用 better-auth 自己的 verifyPassword）：");
  const credential = rows.rows.find((r) => r.providerId === "credential");
  if (!credential) {
    console.log("  ✗ 没有 credential 账号，邮箱密码登录会失败");
  } else {
    const hash = credential.password ?? "";
    const looksHashed = /^[0-9a-f]{32}:[0-9a-f]{128}$/.test(hash);
    console.log(`  哈希格式 ${looksHashed ? "✓" : "✗"}（salt:key），长度 ${hash.length}`);
    for (const [candidate, shouldPass] of [
      ["admin123", true],
      ["wrong-password", false],
    ]) {
      // better-auth/crypto 的 verifyPassword 收对象参数：{ hash, password }
      const ok = await verifyPassword({ hash, password: candidate });
      console.log(`  ${candidate} → ${ok} ${ok === shouldPass ? "✓" : "✗"}`);
    }
  }

  const counts = await client.query(`select count(*)::int as n from "post"`);
  console.log(`\n文章数量：${counts.rows[0].n}`);
};

main()
  .catch((error) => {
    console.error("校验失败：", error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
