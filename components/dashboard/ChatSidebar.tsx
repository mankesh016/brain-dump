import { useState, useEffect, useRef } from "react";
import { Brain, Sparkles, X, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function renderFormattedMessage(text: string) {
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    let cleanLine = line.trim();

    // Check for bullet lists
    const isBullet = cleanLine.startsWith("- ") || cleanLine.startsWith("* ");
    if (isBullet) {
      cleanLine = cleanLine.substring(2);
    }

    // Parse bold text (**bold**)
    const parts = [];
    let currentIdx = 0;
    const regex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = regex.exec(cleanLine)) !== null) {
      if (match.index > currentIdx) {
        parts.push(cleanLine.substring(currentIdx, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-bold text-gray-900">
          {match[1]}
        </strong>,
      );
      currentIdx = regex.lastIndex;
    }

    if (currentIdx < cleanLine.length) {
      parts.push(cleanLine.substring(currentIdx));
    }

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex gap-2 pl-2 py-0.5 items-start">
          <span className="text-indigo-500 font-bold shrink-0">•</span>
          <span className="flex-1">{parts}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className={line.trim() === "" ? "h-2" : "py-0.5"}>
        {parts}
      </p>
    );
  });
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isThinking, isOpen]);

  async function sendMessage(text: string) {
    if (isThinking || isStreaming) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error("Failed to get chat response");
      }

      setIsThinking(false);
      setIsStreaming(true);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) => {
          const next = [...prev];
          if (next.length > 0) {
            next[next.length - 1] = {
              role: "assistant",
              content: accumulated,
            };
          }
          return next;
        });
      }
    } catch (error) {
      console.error(error);
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;
    setInput("");
    sendMessage(query);
  }

  function parseMessageContent(content: string) {
    const parts = content.split("[SOURCES]");
    const text = parts[0].trim();
    const sources = parts[1]
      ? parts[1]
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    return { text, sources };
  }

  const sampleQuestions = ["What did i recently add?", "tell me about database i used", "summarize youtube links"];

  if (!isOpen) return null;

  return (
    <aside className="w-96 bg-white border-l border-gray-200 h-screen flex flex-col z-10 shrink-0 select-none">
      {/* Header */}
      <div className="h-16 border-b border-gray-150 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-600 animate-pulse" />
          <span className="font-bold text-sm text-gray-805">AI Chat Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <Brain size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-gray-800">Chat with your Brain</h3>
              <p className="text-xs text-gray-400 max-w-60">
                Ask questions to find, summarize, or query information in your notes and links.
              </p>
            </div>

            {/* Sample Questions */}
            <div className="w-full pt-4 space-y-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-indigo-650 bg-indigo-50/50 hover:bg-indigo-100/70 border border-indigo-100/50 rounded-xl p-3 transition-all duration-200 cursor-pointer font-semibold"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, index) => {
            const { text, sources } = parseMessageContent(m.content);
            return (
              <div key={index} className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-gray-400 px-1 font-semibold">
                  {m.role === "user" ? "You" : "Gemini AI"}
                </span>
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
                >
                  <div className="select-text space-y-1">
                    {m.role === "user" ? (
                      <div className="whitespace-pre-wrap">{text}</div>
                    ) : (
                      renderFormattedMessage(text)
                    )}
                  </div>

                  {sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-gray-200/70 space-y-1.5 shrink-0 select-text">
                      <div className="text-[9px] font-bold text-gray-450 tracking-wider">CITED SOURCES:</div>
                      <div className="flex flex-col gap-1.5">
                        {sources.map((src, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-gray-200 text-[10px] text-gray-650 font-bold shadow-xs w-fit"
                          >
                            <span>📄</span>
                            <span className="truncate max-w-55">{src}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {isThinking && (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] text-gray-400 px-1 font-semibold">Gemini AI</span>
            <div className="bg-gray-100 text-gray-450 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-2.5 text-xs italic flex items-center gap-1.5">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-150 bg-gray-50/50">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking || isStreaming}
            placeholder="Ask about note contexts..."
            className="flex-1 bg-white border-gray-250 focus-visible:ring-indigo-600 text-xs py-1.5 h-9"
          />
          <Button
            type="submit"
            disabled={isThinking || isStreaming || !input.trim()}
            size="icon"
            className="bg-indigo-650 hover:bg-indigo-750 text-white cursor-pointer h-9 w-9"
          >
            <Send size={14} />
          </Button>
        </form>
        <button
          onClick={() => setMessages([])}
          disabled={messages.length === 0 || isThinking || isStreaming}
          className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 mt-2 block font-bold cursor-pointer transition-colors"
        >
          Clear Chat History
        </button>
      </div>
    </aside>
  );
}
