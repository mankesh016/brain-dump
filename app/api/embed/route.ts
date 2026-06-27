import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { embedText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { itemId } = await req.json();

  const item = await db.item.findUnique({
    where: { id: itemId },
    include: { tags: { include: { tag: true } } },
  });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  const tagText = item.tags.map((t: any) => t.tag.name).join(", ");
  const text = [item.title, item.content, tagText].filter(Boolean).join(". ");
  const vector = await embedText(text);

  await db.embedding.upsert({
    where: { itemId },
    update: { vector },
    create: { itemId, vector },
  });

  return NextResponse.json({ success: true });
}
