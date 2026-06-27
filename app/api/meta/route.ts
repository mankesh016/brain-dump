import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return NextResponse.json({ error: "no url" }, { status: 400 });

  try {
    const res = await axios.get(url, {
      timeout: 5000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = res.data;
    if (typeof html !== "string") {
      throw new Error("Response body is not a string");
    }

    const match = html.match(/<title>(.*?)<\/title>/i);
    const title = match?.[1]?.trim() ?? "";
    return NextResponse.json({ title });
  } catch (error) {
    console.error("Failed to fetch metadata title:", error);
    return NextResponse.json({ error: "failed to fetch" }, { status: 500 });
  }
}
