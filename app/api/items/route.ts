import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";

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
  const { tags = [] } = body;

  const uniqueTags = Array.from(
    new Set(
      (tags as string[])
        .map((name) => name.toLowerCase().trim())
        .filter(Boolean),
    ),
  );

  const item = await db.item.create({
    data: {
      userId: DEV_USER_ID,
      type: body.type,
      title: body.title,
      content: body.content || null,
      url: body.url || null,
      tags: {
        create: uniqueTags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  const host = req.headers.get("host") || "localhost:3001";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  // no await
  axios
    .post(`${baseUrl}/api/embed`, { itemId: item.id })
    .catch((err) => console.error("embed failed:", err));

  return NextResponse.json(item);
}
