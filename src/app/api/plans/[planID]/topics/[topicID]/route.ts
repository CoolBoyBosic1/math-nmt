// export async function GET(request: Request, context: { params: Promise<{ planID: string, topicID: string }> }) {
//     try {
//         const { params } = context;
//         const id = params.topicID;

//         const topic = await prisma.topic.findUnique({
//             where: {
//                 id: id
//             }
//         });
//         return NextResponse.json(topic, { status: 200 });
//     }
//     catch (error: any) {
//         return NextResponse.json({ error: `TopicID error: ${error.message}` }, { status: 503 });
//     }
// };

// export const PATCH = async (request: Request, context: any) => {
//     try {
//         const { params } = context;
//         const id = params.topicID;
//         const { title } = await request.json();

//         const topic = await prisma.topic.update({
//             where: {
//                 id: id
//             },
//             data: {
//                 title: title,
//             }
//         });
//         return NextResponse.json(topic, { status: 200 });
//     }
//     catch (error: any) {
//         return NextResponse.json({ error: `TopicID error: ${error.message}` }, { status: 503 });
//     }
// }

// export const DELETE = async (request: Request, context: any) => {
//     try {
//         const { params } = context;
//         const id = params.topicID;

//         await prisma.topic.delete({
//             where: {
//                 id: id
//             }
//         });
//         return NextResponse.json({ message: `Topic with id ${id} deleted` }, { status: 200 });
//     }
//     catch (error: any) {
//         return NextResponse.json({ error: `TopicID error: ${error.message}` }, { status: 503 });
//     }
// }
export {};
