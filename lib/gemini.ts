import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function embedText(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent({
      content: { role: "user", parts: [{ text }] },
      outputDimensionality: 768,
    } as any);
    return result.embedding.values;
  } catch (error) {
    console.error("Failed to generate embedding from Gemini:", error);
    return new Array(768).fill(0);
  }
}

export async function ragChat(
  query: string,
  contextItems: { title: string; content: string | null }[],
): Promise<ReadableStream<Uint8Array>> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const context = contextItems.map((item, i) => `[${i + 1}] ${item.title}: ${item.content ?? ""}`).join("\n\n");

  const prompt = `You are a helpful assistant with access to the user's personal notes and saved links.
Use only the context below to answer. If the answer is not in the notes, say so honestly.

CONTEXT:
${context}

QUESTION: ${query}`;

  const result = await model.generateContentStream(prompt);

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        controller.enqueue(new TextEncoder().encode(chunk.text()));
      }
      if (contextItems.length > 0) {
        const sourcesString = "\n\n[SOURCES]\n" + contextItems.map((item) => item.title).join("\n");
        controller.enqueue(new TextEncoder().encode(sourcesString));
      }
      controller.close();
    },
  });
}
