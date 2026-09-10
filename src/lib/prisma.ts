import { PrismaPg } from "@prisma/adapter-pg"; // 引入适配器
import { PrismaClient } from "@/generated/prisma/client"; // 引入生成的客户端

// Prisma 7 uses the query-compiler client and requires a driver adapter.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! }); // 创建连接池
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
