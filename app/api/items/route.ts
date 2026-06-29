import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const items = await db.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const body = await req.json();
  const { tags = [] } = body;

  const uniqueTags = Array.from(new Set((tags as string[]).map((name) => name.toLowerCase().trim()).filter(Boolean)));

  const item = await db.item.create({
    data: {
      userId,
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
  const cookie = req.headers.get("cookie");

  // no await
  axios
    .post(`${baseUrl}/api/embed`, { itemId: item.id }, { headers: cookie ? { Cookie: cookie } : {} })
    .catch((err) => console.error("embed failed:", err));

  return NextResponse.json(item);
}
