import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request, context: { params: Promise<{ planID: string }> }) {
    try {
        const { params } = await context;
        const { planID } = await params;

        const { userID } = await prisma.plan.findUniqueOrThrow({
            where: {
                id: planID
            },
            select: {
                userID: true
            }
        });
        return NextResponse.json(userID, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Topics error: ${error.message}` }, { status: 500 });
    }
};