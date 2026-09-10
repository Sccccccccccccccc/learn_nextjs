import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// prisma的所有操作都是异步的，所以需要使用async/await

export async function GET(request: NextRequest) {
    const user = await prisma.user.findMany({
        // select 控制给前端返回哪些字段
        // select: {
        //     id: true,
        //     name: true,
        //     email: true,
        //     createdAt: true,
        // },

        // where 控制查询条件
        // where: {
        // },

        // include 控制关联查询
        include: {
            posts: true, 
        },
        
        orderBy: {
            createdAt: "desc",
        },
        // 分页 从第0条开始，取10条
        skip: 0,
        take: 10,

    });
    return NextResponse.json(user);
}

export async function POST(request: NextRequest) {
    const { name , email } = await request.json();
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: "123456",
        },
    })
    return NextResponse.json(user);
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json();
    const user = await prisma.user.delete({
        where: {
            id,
        },
    })
    return NextResponse.json(user);
}