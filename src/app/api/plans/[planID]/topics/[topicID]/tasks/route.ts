import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { badRequest, errorResponse } from "@/lib/api-error";

export async function GET(request: Request, context: { params: Promise<{ planID: string, topicID: string }> }) {
    try {
        const { params } = await context;
        const { planID, topicID } = await params;

        const { userID } = await prisma.plan.findFirstOrThrow({
            where: {
                id: planID,
            },
            select: {
                userID: true,
            }
        }
        )

        const tasks = await prisma.task.findMany({
            where: {
                topicID: topicID,
                PlanTask: {
                    some: {
                        planID: planID,
                    }
                }
            },
            include: {
                PlanTask: {
                    where: {
                        planID: planID,
                    }
                },
                UserTask: {
                    where: {
                        userID: userID,
                    }
                }
            }
        });

        return NextResponse.json(tasks, { status: 200 });
    }
    catch (error) {
        return errorResponse(error, "GET /api/plans/[planID]/topics/[topicID]/tasks");
    }
}

export async function POST(request: Request, context: { params: Promise<{ planID: string, topicID: string }> }) {
    try {
        const { params } = await context;
        const { planID } = await params;

        const body = await request.json();
        if (!body.taskID) throw badRequest("Require taskID");

        const newPlanTask = await prisma.planTask.create({
            data: {
                planID: planID,
                taskID: body.taskID,
            }
        });
        return NextResponse.json(newPlanTask, { status: 201 });
    }
    catch (error) {
        return errorResponse(error, "POST /api/plans/[planID]/topics/[topicID]/tasks");
    }
};
