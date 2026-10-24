import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ userID: string, topicID: string }> }) {
    const { params } = await context;
    const { userID, topicID } = await params;

    const tasks = await prisma.task.findMany({
        where: {
            topicID: topicID,
        },
        include: {
            UserTask: {
                where: {
                    userID: userID,
                }
            }
        }
    });

    return NextResponse.json(tasks, { status: 200 });
}