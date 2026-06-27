"use client";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { useState, useEffect, use } from "react";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState("NOTE");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [searchType, setSearchType] = useState<"keyword" | "semantic">(
    "keyword",
  );
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  function detectType(urlStr: string): string {
    if (!urlStr) return "NOTE";
    if (urlStr.includes("youtube.com") || urlStr.includes("youtu.be"))
      return "YOUTUBE";
    if (urlStr.includes("twitter.com") || urlStr.includes("x.com"))
      return "TWITTER";
    if (urlStr.includes("linkedin.com")) return "LINKEDIN";
    return "WEBLINK";
  }
  function handleUrlChange(val: string) {
    setUrl(val);
    const detected = detectType(val);
    setType(detected);
  }

  async function generateTitle() {
    if (!url.trim()) return;
    setIsGeneratingTitle(true);
    setMetaError("");
    try {
      const res = await axios.get(
        `/api/meta?url=${encodeURIComponent(url.trim())}`,
      );
      if (res.data.title) {
        setTitle(res.data.title);
      } else {
        setMetaError("Could not fetch title");
      }
    } catch (err) {
      console.error(err);
      setMetaError("Could not fetch title");
    } finally {
      setIsGeneratingTitle(false);
    }
  }

  async function generateTags() {
    if (!title.trim() && !content.trim()) return;
    setIsGeneratingTags(true);
    try {
      const res = await axios.post("/api/tags/generate", {
        title: title.trim(),
        content: content.trim(),
        url: url.trim(),
      });
      if (res.data.tags && res.data.tags.length > 0) {
        setTags(res.data.tags.join(", "));
      }
    } catch (err) {
      console.error("Failed to generate tags:", err);
    } finally {
      setIsGeneratingTags(false);
    }
  }

  async function search() {
    if (!query) {
      setSearchResults(null);
      setLatency(null);
      return;
    }
    try {
      const res = await axios.get(`/api/search?q=${query}&type=${searchType}`);
      setSearchResults(res.data.results);
      setLatency(res.data.latencyMs);
    } catch (err) {
      console.error("Error searching items:", err);
    }
  }

  const fetchItems = async () => {
    try {
      const response = await axios.get("/api/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  async function addItem() {
    if (!url.trim() && !title.trim() && !content.trim()) return;

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await axios.post("/api/items", {
        title: title.trim(),
        content: content.trim() || null,
        type,
        url: url.trim() || null,
        tags: tagsArray,
      });
      setTitle("");
      setContent("");
      setUrl("");
      setType("NOTE");
      setTags("");
      setMetaError("");
      await fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  }

  const BADGE_STYLES: Record<string, string> = {
    YOUTUBE: "bg-red-100 text-red-850 border-red-200",
    WEBLINK: "bg-green-100 text-green-850 border-green-200",
    TWITTER: "bg-sky-100 text-sky-850 border-sky-200",
    LINKEDIN: "bg-blue-100 text-blue-850 border-blue-200",
  };

  const canSubmit = !!(url.trim() || title.trim() || content.trim());

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Brain Dump</h1>

      {/* Add Item Form */}
      <div className="border border-gray-300 rounded p-4 mb-6 flex flex-col gap-3">
        {/* 1. URL Input */}
        <input
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="URL"
          className="p-2 border border-gray-300 rounded"
        />

        {/* 2. Title Input & Generate Title Button */}
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button
            type="button"
            onClick={generateTitle}
            disabled={!url.trim() || isGeneratingTitle}
            className="bg-gray-200 text-gray-700 p-2 rounded text-sm px-3 disabled:opacity-50"
          >
            {isGeneratingTitle ? "Fetching..." : "Generate Title"}
          </button>
        </div>
        {metaError && <span className="text-xs text-red-500">{metaError}</span>}

        {/* 3. Content Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write content..."
          rows={3}
          className="p-2 border border-gray-300 rounded"
        />

        {/* 4. Tags Input & Generate Tags Button */}
        <div className="flex gap-2">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button
            type="button"
            onClick={generateTags}
            disabled={(!title.trim() && !content.trim()) || isGeneratingTags}
            className="bg-gray-200 text-gray-700 p-2 rounded text-sm px-3 disabled:opacity-50"
          >
            {isGeneratingTags ? "Generating..." : "Generate Tags"}
          </button>
        </div>
        {tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-200"
                >
                  #{tag}
                </span>
              ))}
          </div>
        )}

        {/* 5. Type selector, Add Item Button */}
        <div className="flex justify-between items-center gap-2 mt-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-white"
          >
            <option>NOTE</option>
            <option>YOUTUBE</option>
            <option>WEBLINK</option>
            <option>TWITTER</option>
            <option>LINKEDIN</option>
          </select>

          <button
            onClick={addItem}
            disabled={!canSubmit}
            className="bg-gray-800 text-white p-2 rounded px-4 disabled:opacity-50 text-sm"
          >
            Add Item
          </button>
        </div>
      </div>

      <hr className="border-gray-300 mb-6" />

      {/* Search bar */}
      <div className="flex gap-2 flex-col mb-6">
        <div className="flex gap-2 items-center mb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search..."
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={search}
            className="bg-gray-800 text-white p-2 rounded px-4"
          >
            Search
          </button>
        </div>

        {/* Search type toggles */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSearchType("keyword")}
            className={`text-xs px-3 py-1.5 rounded border ${
              searchType === "keyword"
                ? "bg-gray-800 text-white border-gray-850"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Keyword
          </button>
          <button
            onClick={() => setSearchType("semantic")}
            className={`text-xs px-3 py-1.5 rounded border ${
              searchType === "semantic"
                ? "bg-gray-800 text-white border-gray-850"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Semantic
          </button>
        </div>

        {latency !== null && (
          <span className="text-xs text-gray-500">
            (searched in {latency}ms)
          </span>
        )}
      </div>

      {/* Items List */}
      <div className="flex flex-col gap-3">
        {(searchResults ?? items).map((item) => (
          <div key={item.id} className="border border-gray-300 rounded p-4">
            <div className="flex items-start justify-between gap-4">
              <strong className="text-lg font-bold leading-snug">
                {item.title}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors inline-flex items-center ml-2"
                    title={item.url}
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </strong>
              <span
                className={`text-xs px-2 py-0.5 rounded border shrink-0 ${
                  BADGE_STYLES[item.type] ||
                  "bg-gray-100 text-gray-850 border-gray-200"
                }`}
              >
                {item.type}
              </span>
            </div>
            {item.content && (
              <p className="mt-2 text-gray-600 text-sm">{item.content}</p>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {item.tags.map((t: any) => (
                  <span
                    key={t.tag.id || t.tag.name}
                    className="text-xs bg-gray-100 text-gray-605 px-2 py-0.5 rounded border border-gray-200"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
