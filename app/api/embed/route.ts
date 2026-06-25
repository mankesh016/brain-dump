import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { embedText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { itemId } = await req.json();

  const item = await db.item.findUnique({ where: { id: itemId } });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  const text = [item.title, item.content].filter(Boolean).join(". ");
  const vector = await embedText(text);

  await db.embedding.upsert({
    where: { itemId },
    update: { vector },
    create: { itemId, vector },
  });

  return NextResponse.json({ success: true });
}
