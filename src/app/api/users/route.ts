import { NextResponse } from "next/server";
import { isValidNickname, isValidEmail, isValidPassword } from "@/lib/validator/user";
import { prisma } from "@/lib/db";
import { User } from "@prisma/client";
import { hashPassword, publicUserSelect } from "@/lib/users";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: publicUserSelect });
    return NextResponse.json(users, { status: 200 });
  }
  catch (error) {
    return NextResponse.json({ error: `Failed to fetch users: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.nickname) throw new Error("Require nickname");
    if (!body.email) throw new Error("Require email");
    if (!body.password) throw new Error("Require password");

    if (!isValidNickname(body.nickname)) throw new Error("Nickname must include: A-Z,a-z,0-9 and must be up to 20 symbols");
    if (!isValidEmail(body.email)) throw new Error("Invalid email");
    if (!isValidPassword(body.password)) throw new Error("The password must include: A-Z,a-z,0-9 and must have a length 8-20 symbols");

    const user: User = { ...body, password: await hashPassword(body.password) };

    const newUser = await prisma.user.create({ data: user, select: publicUserSelect });


    return NextResponse.json(newUser, { status: 200 });

  }
  catch (error) {

    if (error.code === "P2002") {
      return NextResponse.json({ error: "This email has already been registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }

}

