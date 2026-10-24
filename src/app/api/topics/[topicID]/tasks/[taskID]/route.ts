import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Task } from "@prisma/client";

export async function GET(req: Request, context: { params: Promise<{ topicID: string, taskID: string }> }) {
    try {
        const { params } = await context;
        const { topicID, taskID } = await params;

        const task = await prisma.task.findUniqueOrThrow({
            where: {
                id: taskID,
                topicID: topicID
            }
        });
        return NextResponse.json(task, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Wrong topic ID or task ID error: ${error.message}` }, { status: 404 });
    }
}

export async function PUT(request: Request, context: { params: Promise<{ topicID: string, taskID: string }> }) {
    try {
        const { params } = context;
        const { topicID, taskID } = await params;

        const body = await request.json();

        if (!body.description) throw new Error("Require description");
        if (!body.problem) throw new Error("Require problem");
        if (!body.solution) throw new Error("Require solution");
        if (!body.type) throw new Error("Require type");
        if (!body.answer) throw new Error("Require answer");

        const task: Task = body;

        const updatedTask = await prisma.task.update({
            where: {
                id: taskID,
                topicID: topicID
            },
            data: task,
        });

        return NextResponse.json(updatedTask, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Update Task error: ${error.message}` }, { status: 404 });
    }
}

export async function PATCH(request: Request, context: { params: Promise<{ topicID: string, taskID: string }> }) {
    try {
        const { params } = context;
        const { topicID, taskID } = await params;

        const body = await request.json();

        const task: Task = body;

        const updatedTask = await prisma.task.update({
            where: {
                id: taskID,
                topicID: topicID
            },
            data: task,
        });

        return NextResponse.json(updatedTask, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Update Task error: ${error.message}` }, { status: 404 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ topicID: string, taskID: string }> }) {
    try {
        const { params } = context;
        const { topicID, taskID } = await params;

        const deletedTask = await prisma.task.delete({
            where: {
                id: taskID,
                topicID: topicID
            },
        });

        return NextResponse.json(deletedTask, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Delete Task error: ${error.message}` }, { status: 404 });
    }
}