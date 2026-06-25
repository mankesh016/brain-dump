import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEV_USER_ID = process.env.DEV_USER_ID!;

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const start = Date.now();

  const results = await db.item.findMany({
    where: {
      userId: DEV_USER_ID,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  const latencyMs = Date.now() - start;
  console.log(
    `[search] keyword "${q}" → ${results.length} results in ${latencyMs}ms`,
  );

  return NextResponse.json({ results, latencyMs });
}
