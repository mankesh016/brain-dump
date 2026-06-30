import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEV_USER_ID = process.env.DEV_USER_ID!;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const items = await db.item.findMany({
      where: { userId },
      select: { type: true },
    });

    const counts: Record<string, number> = {
      NOTE: 0,
      YOUTUBE: 0,
      TWITTER: 0,
      LINKEDIN: 0,
      WEBLINK: 0,
      SPOTIFY: 0,
    };

    items.forEach((item: any) => {
      if (item.type in counts) {
        counts[item.type]++;
      } else {
        counts[item.type] = 1;
      }
    });

    const total = items.length;

    return NextResponse.json({
      ...counts,
      total,
    });
  } catch (error) {
    console.error("GET counts failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
