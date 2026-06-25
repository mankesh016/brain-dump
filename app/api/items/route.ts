import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEV_USER_ID = process.env.DEV_USER_ID!;

export async function GET() {
  const items = await db.item.findMany({
    where: { userId: DEV_USER_ID },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const item = await db.item.create({
    data: {
      user: DEV_USER_ID,
      type: body.type,
      title: body.title,
      content: body.content || null,
      url: body.url || null,
    },
  });

  return NextResponse.json(item);
}
