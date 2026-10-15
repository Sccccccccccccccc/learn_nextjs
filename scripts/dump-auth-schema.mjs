// 从 better-auth 运行时导出权威表结构（以当前 auth 配置为准）
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { getSchema } from "better-auth/db";

// 与 src/lib/auth.ts 保持一致的配置（除 adapter 换成内存实现，仅用于取表结构）
const auth = betterAuth({
  database: memoryAdapter({}),
  emailAndPassword: { enabled: true },
});

const schema = getSchema(auth.options);

for (const [model, def] of Object.entries(schema)) {
  console.log(`\n=== ${model} ===`);
  for (const [field, f] of Object.entries(def.fields)) {
    const bits = [
      `type=${f.type}`,
      f.required ? "required" : "optional",
      f.unique ? "unique" : null,
      f.references ? `ref=${f.references.model}.${f.references.field}` : null,
      f.defaultValue !== undefined ? `default=${JSON.stringify(f.defaultValue)}` : null,
      f.fieldName ? `fieldName=${f.fieldName}` : null,
      f.bigint ? "bigint" : null,
      f.sortable ? "sortable" : null,
    ].filter(Boolean);
    console.log(`  ${field}: ${bits.join(", ")}`);
  }
  if (def.indexes?.length) {
    console.log(`  indexes: ${JSON.stringify(def.indexes)}`);
  }
}
