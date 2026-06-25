"use client";
import axios from "axios";
import { useState, useEffect, use } from "react";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("NOTE");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [searchType, setSearchType] = useState<"keyword" | "semantic">(
    "keyword",
  );

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
    if (!title) return;
    try {
      await axios.post("/api/items", { title, content, type });
      setTitle("");
      setContent("");
      await fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  }

  const BADGE_STYLES: Record<string, string> = {
    YOUTUBE: "bg-red-100 text-red-850 border-red-200",
    WEBLINK: "bg-green-100 text-green-850 border-green-200",
    TWITTER: "bg-sky-100 text-sky-850 border-sky-200",
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Brain Dump</h1>

      {/* Add Item Form */}
      <div className="border border-gray-300 rounded p-4 mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-white"
          >
            <option>NOTE</option>
            <option>YOUTUBE</option>
            <option>WEBLINK</option>
            <option>TWITTER</option>
          </select>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write content..."
          rows={3}
          className="p-2 border border-gray-300 rounded"
        />

        <button
          onClick={addItem}
          className="bg-gray-800 text-white p-2 rounded self-end px-4"
        >
          Add Item
        </button>
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
            <div className="flex items-center justify-between">
              <strong className="text-lg">{item.title}</strong>
              <span
                className={
                  "text-xs px-2 py-0.5 rounded border bg-gray-100 text-gray-850 border-gray-200"
                }
              >
                {item.type}
              </span>
            </div>
            {item.content && (
              <p className="mt-2 text-gray-600 text-sm">{item.content}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
