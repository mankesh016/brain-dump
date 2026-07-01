import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { embedText, ragChat } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { message } = body;
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Embed the user message
    const embedding = await embedText(message);
    const vectorStr = `[${embedding.join(",")}]`;

    // 2. Query top 5 most similar items via pgvector
    const similarItems: { title: string; content: string | null }[] = await db.$queryRawUnsafe(
      `SELECT i.title, i.content
       FROM "Item" i
       JOIN "Embedding" e ON e."itemId" = i.id
       WHERE i."userId" = $1 AND (cast(e.vector as vector) <=> $2::vector) <= 0.80
       ORDER BY cast(e.vector as vector) <=> $2::vector
       LIMIT 5`,
      userId,
      vectorStr,
    );

    // 3. Call ragChat to get a ReadableStream
    const stream = await ragChat(message, similarItems);

    // 4. Return streaming response
    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
