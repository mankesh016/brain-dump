"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CARD_THEMES, SIDEBAR_ITEMS } from "@/lib/constants";
import axios from "axios";
import { ExternalLink, Pencil, Search, Trash2, FileText, Plus } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [searchType, setSearchType] = useState<"keyword" | "semantic">("keyword");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  function detectType(urlStr: string): string {
    if (!urlStr) return "NOTE";
    const low = urlStr.toLowerCase();
    if (low.includes("youtube.com") || low.includes("youtu.be")) return "YOUTUBE";
    if (low.includes("twitter.com") || low.includes("x.com")) return "TWITTER";
    if (low.includes("linkedin.com")) return "LINKEDIN";
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
      const res = await axios.get(`/api/meta?url=${encodeURIComponent(url.trim())}`);
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
    if (!query.trim()) {
      setSearchResults(null);
      setLatency(null);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axios.get(`/api/search?q=${query}&type=${searchType}`);
      setSearchResults(res.data.results);
      setLatency(res.data.latencyMs);
    } catch (err) {
      console.error("Error searching items:", err);
    } finally {
      setIsSearching(false);
    }
  }

  const fetchItems = async () => {
    try {
      const response = await axios.get("/api/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Debounced search trigger
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      setLatency(null);
      return;
    }
    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchType]);

  async function addItem() {
    setIsAdding(true);
    setAddError("");
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
      setIsAddOpen(false);
      await fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
      setAddError("Error adding item");
    } finally {
      setIsAdding(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB"); // DD/MM/YYYY
  }

  const canSubmit = !!(url.trim() || title.trim() || content.trim());

  const displayedItems = (searchResults ?? items).filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  const SkeletonCard = () => (
    <div className="break-inside-avoid mb-4 border border-gray-200 rounded-xl bg-white p-4 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded" />
      <div className="flex gap-1.5 mt-2">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <div className="flex justify-between mt-3">
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* 1. Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 flex flex-col p-4 z-20">
        <div className="flex items-center gap-2 px-2 py-3 mb-6">
          <span className="font-bold text-lg text-gray-800">Brain Dump</span>
        </div>

        <nav className="flex-1 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.filter;
            return (
              <button
                key={item.name}
                onClick={() => setActiveFilter(item.filter)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 2. Main content area wrapper */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 gap-4">
          {/* Search container */}
          <div className="flex items-center gap-2 max-w-md w-full relative">
            <Search size={18} className="text-gray-400 absolute left-3" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, tags or content..."
              className="pl-10 w-full border-gray-200 focus-visible:ring-blue-600"
            />
          </div>

          {/* Search Toggle Buttons */}
          <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50 shrink-0">
            <button
              onClick={() => setSearchType("keyword")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                searchType === "keyword"
                  ? "bg-white text-gray-850 font-semibold shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Keyword
            </button>
            <button
              onClick={() => setSearchType("semantic")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                searchType === "semantic"
                  ? "bg-white text-gray-850 font-semibold shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              AI Semantic
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* shadcn Dialog modal wrapper */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-9 inline-flex items-center justify-center rounded-lg px-3.5 text-sm font-medium shadow-sm cursor-pointer border border-transparent shrink-0">
                <Plus size={16} />
                <span>Add Item</span>
              </DialogTrigger>

              <DialogContent className="sm:max-w-105">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  {/* 1. URL input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">URL</label>
                    <Input
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* 2. Title input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-600">Title</label>
                      <button
                        type="button"
                        onClick={generateTitle}
                        disabled={!url.trim() || isGeneratingTitle}
                        className="text-xs text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline font-medium"
                      >
                        {isGeneratingTitle ? "Fetching..." : "Generate Title"}
                      </button>
                    </div>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
                    {metaError && <span className="text-[10px] text-red-500">{metaError}</span>}
                  </div>

                  {/* 3. Content textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">Content</label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write content..."
                      rows={3}
                    />
                  </div>

                  {/* 4. Tags input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-600">Tags</label>
                      <button
                        type="button"
                        onClick={generateTags}
                        disabled={(!title.trim() && !content.trim()) || isGeneratingTags}
                        className="text-xs text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline font-medium"
                      >
                        {isGeneratingTags ? "Generating..." : "Generate Tags"}
                      </button>
                    </div>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="typescript, webdev, ai"
                    />
                  </div>

                  {/* 5. Type selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md bg-white text-sm"
                    >
                      <option>NOTE</option>
                      <option>YOUTUBE</option>
                      <option>WEBLINK</option>
                      <option>TWITTER</option>
                      <option>LINKEDIN</option>
                      <option>SPOTIFY</option>
                    </select>
                  </div>

                  <Button
                    onClick={addItem}
                    disabled={!canSubmit || isAdding}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                  >
                    {isAdding ? "Adding..." : "Add Item"}
                  </Button>
                  {addError && <span className="text-xs text-red-500 text-center">{addError}</span>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content body container */}
        <main className="p-6 flex-1 flex flex-col">
          {/* Search results latency & count stats */}
          {query.trim() && !isLoading && (
            <div className="mb-4 text-xs text-gray-500 font-semibold px-1">
              {isSearching ? (
                <span>Searching...</span>
              ) : (
                <span>
                  {displayedItems.length} results · {latency ?? 0}ms
                </span>
              )}
            </div>
          )}

          {/* Cards list grid */}
          {isLoading ? (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <span className="text-gray-400 text-sm mb-1">No items found</span>
              <span className="text-xs text-gray-400">Add a new item or adjust your search filter</span>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {displayedItems.map((item) => {
                const theme = CARD_THEMES[item.type] || CARD_THEMES.NOTE;
                const CardIcon = SIDEBAR_ITEMS.find((s) => s.filter === item.type)?.icon || FileText;

                return (
                  <div
                    key={item.id}
                    className={`break-inside-avoid border border-gray-200 rounded-xl bg-white p-4 shadow-sm flex flex-col gap-3 relative transition-all hover:shadow-md ${theme.border}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${theme.iconBg} ${theme.iconColor}`}>
                          <CardIcon size={16} />
                        </div>
                        <strong className="text-sm font-bold text-gray-800 leading-snug line-clamp-1">
                          {item.title}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600 transition-colors inline-flex items-center align-middle ml-1.5"
                              title={item.url}
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </strong>
                      </div>

                      {/* Edit & Delete Action Placeholders */}
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <button className="hover:text-gray-600 p-0.5 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button className="hover:text-red-600 p-0.5 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* YouTube Video Thumbnail Preview (only if imageUrl is present in DB) */}
                    {item.type === "YOUTUBE" && item.imageUrl && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative rounded-lg overflow-hidden group cursor-pointer border border-gray-100 block"
                      >
                        <img src={item.imageUrl} alt="YouTube Thumbnail" className="w-full h-auto object-cover" />
                      </a>
                    )}

                    {/* Content Preview */}
                    {item.content && (
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-4 whitespace-pre-line">
                        {item.content}
                      </p>
                    )}

                    {/* Tags Badges */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((t: any) => (
                          <span
                            key={t.tag.id || t.tag.name}
                            className={`text-[10px] px-2 py-0.5 rounded border ${theme.tagClass}`}
                          >
                            #{t.tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Dates at bottom */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
                      <span>Added: {formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
