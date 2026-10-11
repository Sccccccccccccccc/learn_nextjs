import { betterAuth } from "better-auth"; //引入better-auth
import { prismaAdapter } from "better-auth/adapters/prisma"; //引入prisma适配器
import { PrismaClient } from '@/generated/prisma/client' //引入prisma客户端
import { PrismaPg } from '@prisma/adapter-pg' //引入pgsql适配器
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL }) //连接数据库
const prisma = new PrismaClient({ adapter }); //创建客户端
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql', //指定数据库类型
    }),
    emailAndPassword: {
        enabled: true, //开启邮箱密码认证
    },
});