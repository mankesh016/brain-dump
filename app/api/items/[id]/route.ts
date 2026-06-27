import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";

const DEV_USER_ID = process.env.DEV_USER_ID!;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, url, type, tags = [] } = body;

    const itemCheck = await db.item.findUnique({
      where: { id },
    });

    if (!itemCheck || itemCheck.userId !== DEV_USER_ID) {
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

    // Trigger re-embedding since contents changed
    axios.post(`${baseUrl}/api/embed`, { itemId: updatedItem.id }).catch((err) => console.error("embed failed:", err));

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("PUT item failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const itemCheck = await db.item.findUnique({
      where: { id },
    });

    if (!itemCheck || itemCheck.userId !== DEV_USER_ID) {
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
