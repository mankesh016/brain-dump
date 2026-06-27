import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { title, content, url } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Generate 3-5 short relevant tags for the following content.
Return ONLY a JSON array of lowercase strings, no explanation, no markdown.
Example: ["typescript", "webdev", "tutorial"]

Title: ${title ?? ""}
Content: ${content ?? ""}
URL: ${url ?? ""}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let cleaned = text;
    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```(json)?/, "")
        .replace(/```$/, "")
        .trim();
    }
    const tags = JSON.parse(cleaned);
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("AI Tags generation failed:", error);
    return NextResponse.json({ tags: [] });
  }
}
