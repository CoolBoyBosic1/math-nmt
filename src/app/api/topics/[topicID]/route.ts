import { Topic } from "@prisma/client";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ topicID: string }> }) {
    try {
        const { params } = await context;
        const { topicID } = await params;
        const topic = await prisma.topic.findUniqueOrThrow({
            where: {
                id: topicID,
            },
            select: {
                id: true,
                title: true,
                Task: true,
                Plan: true,
                Theory: true,
              },
        });
        return NextResponse.json(topic, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Topic ID error: ${error.message}` }, { status: 404 });
    }
}

// export async function GET(
//     request: Request,
//     { params }: { params: Promise<{ topicId: string }> }
//   ) {
//     try {
//       const { topicId } = params;
//       // Знаходимо тему за ID та включаємо пов'язані завдання (Task)
//       const topic = await prisma.topic.findUnique({
//         where: { id: topicId },
//         include: { Task: true },
//       });
  
//       if (!topic) {
//         return NextResponse.json({ error: "Тему не знайдено" }, { status: 404 });
//       }
  
//       return NextResponse.json({ Task: topic.Task });
//     } catch (error: any) {
//       console.error("Error fetching tasks:", error);
//       return NextResponse.json({ error: "Сталася помилка" }, { status: 500 });
//     }
//   }

export async function PUT(request: Request, context: { params: Promise<{ topicID: string }> }) {
    try {
        const { params } = await context;
        const { topicID } = await params;

        const body = await request.json();

        if (!body.parentID) throw new Error("Require parentID");
        if (!body.title) throw new Error("Require title");

        const topic: Topic = body;

        const updatedTopic = await prisma.topic.update({
            where: {
                id: topicID,
            },
            data: topic,
        });

        return NextResponse.json(updatedTopic, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Topic error: ${error.message}` }, { status: 501 });
    }
}

export async function PATCH(request: Request, context: { params: Promise<{ topicID: string }> }) {
    try {
        const { params } = await context;
        const { topicID } = await params;

        const body = await request.json();

        const topic: Topic = body;

        const updatedTopic = await prisma.topic.update({
            where: {
                id: topicID,
            },
            data: topic,
        });

        return NextResponse.json(updatedTopic, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Topic error: ${error.message}` }, { status: 501 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ topicID: string }> }) {
    try {
        const { params } = context;
        const { topicID } = await params;

        const deletedTopic = await prisma.topic.delete({
            where: {
                id: topicID,
            },
        });

        return NextResponse.json(deletedTopic, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Topic delete error: ${error.message}` }, { status: 400 });
    }
}