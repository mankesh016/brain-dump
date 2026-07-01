"use client";
import { AddDialog } from "@/components/dashboard/AddDialog";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";
import { DeleteDialog } from "@/components/dashboard/DeleteDialog";
import { EditDialog } from "@/components/dashboard/EditDialog";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SIDEBAR_ITEMS } from "@/lib/constants";
import axios from "axios";
import { Brain, LogOut, Moon, MoreVertical, Search, Sparkles, Sun, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";

function DashboardPageContent() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [searchType, setSearchType] = useState<"keyword" | "semantic">("keyword");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setIsAddOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const [counts, setCounts] = useState<Record<string, number>>({
    NOTE: 0,
    YOUTUBE: 0,
    TWITTER: 0,
    LINKEDIN: 0,
    SPOTIFY: 0,
    WEBLINK: 0,
    total: 0,
  });

  // Edit & Delete Selection states
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const fetchCounts = async () => {
    try {
      const res = await axios.get("/api/items/counts");
      setCounts(res.data);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

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
      await fetchCounts();
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

  async function deleteItem() {
    if (!deleteItemId) return;
    try {
      await axios.delete(`/api/items/${deleteItemId}`);
      setItems((prev) => prev.filter((item) => item.id !== deleteItemId));
      if (searchResults) {
        setSearchResults((prev) => (prev ? prev.filter((item) => item.id !== deleteItemId) : null));
      }
      setDeleteItemId(null);
      await fetchCounts();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  }

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
    <div className="flex h-screen bg-gray-50/50 overflow-hidden">
      {/* 1. Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 flex flex-col p-4 z-20">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-2 py-3 mb-6 hover:opacity-90 transition-all duration-200 select-none"
        >
          <div className="p-1.5 bg-blue-600 rounded-lg shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-md text-gray-800 tracking-tight">Brain Dump</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.filter;
            const countKey = item.filter === "all" ? "total" : item.filter;
            const countVal = counts[countKey] ?? 0;

            return (
              <button
                key={item.name}
                onClick={() => setActiveFilter(item.filter)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                  <span>{item.name}</span>
                </div>
                <span className={`text-xs ${isActive ? "text-blue-600 font-bold" : "text-gray-400"}`}>{countVal}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar bottom user section */}
        {session?.user && (
          <div ref={userMenuRef} className="mt-auto pt-4 border-t border-gray-200 relative select-none">
            {showUserMenu && (
              <div className="absolute bottom-16 right-0 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 cursor-pointer font-bold"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </div>
            )}

            {/* Dark Mode toggle sidebar item */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left cursor-pointer mb-2 font-medium"
            >
              {isDark ? (
                <>
                  <Sun size={18} className="text-amber-500" />
                  <span>Light mode</span>
                </>
              ) : (
                <>
                  <Moon size={18} className="text-gray-500" />
                  <span>Dark mode</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50/70 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center shrink-0">
                  <User size={15} className="text-indigo-500" />
                </div>
                <span className="text-xs font-bold text-gray-700 truncate max-w-28" title={session.user.name ?? ""}>
                  {session.user.name}
                </span>
              </div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="text-gray-400 hover:text-gray-650 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              >
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* 2. Main content area wrapper */}
      <div className="ml-60 flex-1 flex flex-col h-screen overflow-hidden">
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
            <Button
              variant="outline"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1.5 h-fit shadow-none shrink-0 ${
                isChatOpen
                  ? "bg-indigo-650 text-white hover:bg-indigo-750 border-indigo-650"
                  : "text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
              }`}
            >
              <Sparkles size={13} />
              <span>AI Assistant</span>
            </Button>

            {/* shadcn Dialog modal wrapper */}
            <AddDialog open={isAddOpen} onOpenChange={setIsAddOpen} onAddSuccess={fetchItems} />
          </div>
        </header>

        {/* Content body container */}
        <main className="p-6 flex-1 flex flex-col overflow-y-auto">
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
            <div
              className={`columns-1 sm:columns-2 md:columns-3 ${isChatOpen ? "lg:columns-3" : "lg:columns-4"} gap-4 space-y-4`}
            >
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
            <div
              className={`columns-1 sm:columns-2 md:columns-3 ${isChatOpen ? "lg:columns-3" : "lg:columns-4"} gap-4 space-y-4`}
            >
              {displayedItems.map((item) => (
                <ItemCard key={item.id} item={item} onEdit={setEditItem} onDeleteTrigger={setDeleteItemId} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* AI Chat Sidebar */}
      <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* 3. Edit Item Dialog Modal */}
      <EditDialog item={editItem} onClose={() => setEditItem(null)} onEditSuccess={fetchItems} />

      {/* 4. Delete Item AlertDialog */}
      <DeleteDialog itemId={deleteItemId} onClose={() => setDeleteItemId(null)} onDeleteConfirm={deleteItem} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-xs font-bold text-gray-400">Loading your workspace...</div>}
    >
      <DashboardPageContent />
    </Suspense>
  );
}
