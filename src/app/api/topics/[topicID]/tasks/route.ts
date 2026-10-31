import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Task } from "@prisma/client";

export async function GET(request: Request, context: { params: Promise<{ topicID: string }> }) {
    try {
        const { params } = await context;
        const { topicID } = await params;
        const tasks = await prisma.task.findMany({
            where: {
                topicID: topicID,
            },
        });

        return NextResponse.json(tasks, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Topic ID error: ${error.message}` }, { status: 404 });
    }
}


export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.topicID) throw new Error("Require topicID");
        if (!body.description) throw new Error("Require description");
        if (!body.problem) throw new Error("Require problem");
        if (!body.solution) throw new Error("Require solution");
        if (!body.type) throw new Error("Require type");
        if (!body.answer) throw new Error("Require answer");

        const task: Task = body;

        const newTask = await prisma.task.create({
            data: task,
        })

        return NextResponse.json(newTask, { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ error: `Wrong task parameters: ${error.message}` }, { status: 400 });
    }
}