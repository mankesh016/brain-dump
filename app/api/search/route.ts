import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const q = new URL(req.url).searchParams.get("q") ?? "";
  const type = new URL(req.url).searchParams.get("type") ?? "keyword";

  const start = Date.now();

  if (type === "semantic") {
    const { embedText } = await import("@/lib/gemini");
    const queryVec = await embedText(q);

    const items = await db.item.findMany({
      where: { userId },
      include: {
        embedding: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const results = items
      .filter((item: any) => item.embedding && item.embedding.vector && item.embedding.vector.length > 0)
      .map((item: any) => {
        const similarity = cosineSimilarity(queryVec, item.embedding!.vector);
        return {
          ...item,
          similarity,
        };
      })
      .filter((item: any) => item.similarity >= 0.65)
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, 20);

    const latencyMs = Date.now() - start;
    console.log(
      `[search] semantic "${q}" → ${results.length} results in ${latencyMs}ms. Scores:`,
      results.map((r: any) => `${r.title}: ${r.similarity.toFixed(4)}`),
    );
    return NextResponse.json({ results, latencyMs });
  }

  const results = await db.item.findMany({
    where: {
      userId,
      OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }],
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const latencyMs = Date.now() - start;
  console.log(`[search] keyword "${q}" → ${results.length} results in ${latencyMs}ms`);

  return NextResponse.json({ results, latencyMs });
}
