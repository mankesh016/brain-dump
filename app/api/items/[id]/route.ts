import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEV_USER_ID = process.env.DEV_USER_ID!;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { id } = await params;
    const body = await req.json();
    const { title, content, url, type, tags = [] } = body;

    const itemCheck = await db.item.findUnique({
      where: { id },
    });

    if (!itemCheck || itemCheck.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 404 });
    }

    // Delete all existing ItemTag relations for this item
    await db.itemTag.deleteMany({
      where: { itemId: id },
    });

    const uniqueTags = Array.from(new Set((tags as string[]).map((name) => name.toLowerCase().trim()).filter(Boolean)));

    const updatedItem = await db.item.update({
      where: { id },
      data: {
        title,
        content: content || null,
        url: url || null,
        type,
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

    // Trigger re-embedding since contents changed
    axios
      .post(`${baseUrl}/api/embed`, { itemId: updatedItem.id }, { headers: cookie ? { Cookie: cookie } : {} })
      .catch((err) => console.error("embed failed:", err));

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("PUT item failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { id } = await params;

    const itemCheck = await db.item.findUnique({
      where: { id },
    });

    if (!itemCheck || itemCheck.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 404 });
    }

    await db.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE item failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
