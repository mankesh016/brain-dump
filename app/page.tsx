"use client";

import axios from "axios";
import Link from "next/link";
import { Brain, ArrowRight, Search, Sparkles, Link2, Tag, FileText, Plus, LogOut, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

const FEATURES = [
  {
    title: "Quick Notes",
    description: "Capture thoughts, project planning ideas, or journal entries in structured note cards.",
    icon: FileText,
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-100",
  },
  {
    title: "Rich Link Cards",
    description:
      "Add URLs from YouTube, Twitter, and Spotify. Automatically extracts thumbnails and clickable hostname badges.",
    icon: Link2,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-100",
  },
  {
    title: "AI Semantic Search",
    description:
      "Query your brain with natural language concepts. Instantly matching meaning rather than exact keywords.",
    icon: Search,
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-100",
  },
  {
    title: "Auto-Tag Generation",
    description:
      "Leverage Google Gemini to analyze title/content details and suggest contextual tags for auto-tagging.",
    icon: Tag,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-100",
  },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [showHeaderUserMenu, setShowHeaderUserMenu] = useState(false);
  const headerUserMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      axios
        .get("/api/items/counts")
        .then((res) => {
          setItemsCount(res.data.total ?? 0);
        })
        .catch((err) => {
          console.error("Error fetching items count:", err);
        });
    }
  }, [status]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerUserMenuRef.current && !headerUserMenuRef.current.contains(event.target as Node)) {
        setShowHeaderUserMenu(false);
      }
    }
    if (showHeaderUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHeaderUserMenu]);

  const isLoggedIn = status === "authenticated" && session?.user;

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* 1. Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-500/10">
            <Brain size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">Brain Dump</span>
        </Link>

        {/* Auth Section in Header */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 select-none">
              <Button
                asChild
                variant="outline"
                className="text-sm font-bold border-gray-250 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all h-fit cursor-pointer flex items-center gap-1.5"
              >
                <Link href="/dashboard">
                  <span>Go to dashboard</span>
                </Link>
              </Button>

              {/* User Dropdown */}
              <div ref={headerUserMenuRef} className="relative">
                <button
                  onClick={() => setShowHeaderUserMenu(!showHeaderUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 uppercase">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-bold text-gray-700 max-w-30 truncate hidden sm:inline">
                    {session?.user?.name}
                  </span>
                  <MoreVertical size={13} className="text-gray-400" />
                </button>

                {showHeaderUserMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-3 py-2 border-b border-gray-100 text-xs text-gray-500 font-semibold truncate">
                      Logged in as{" "}
                      <strong className="text-gray-700 block mt-0.5 truncate">{session?.user?.name}</strong>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-red-650 hover:bg-red-50 hover:text-red-750 transition-colors flex items-center gap-2 cursor-pointer font-bold"
                    >
                      <LogOut size={13} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                asChild
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 cursor-pointer"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 px-5 py-2.5 rounded-xl transition-all duration-200 h-fit cursor-pointer"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 flex flex-col pt-32 px-6 md:px-12 max-w-7xl mx-auto w-full items-center text-center">
        {/* Banner Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6 tracking-wide uppercase">
          <Sparkles size={12} />
          <span>Now with AI Semantic Search</span>
        </div>

        {/* Hero Title */}
        {isLoggedIn ? (
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] max-w-3xl mb-6">
            Pick up where <br />
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              you left off.
            </span>
          </h1>
        ) : (
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] max-w-3xl mb-6">
            Your Digital Mind, <br />
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Supercharged by AI.
            </span>
          </h1>
        )}

        {/* Hero Subtext */}
        {isLoggedIn ? (
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed mb-8 font-medium">
            You have {itemsCount} {itemsCount === 1 ? "item" : "items"} saved across your brains. Jump back in.
          </p>
        ) : (
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed mb-8 font-medium">
            Brain Dump is a minimalist, secure digital workspace to organize your personal notes, YouTube video
            thumbnails, social posts, and web links. Retrieve them semantically in seconds.
          </p>
        )}

        {/* CTA Actions */}
        {isLoggedIn ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
            <Button
              asChild
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 h-fit cursor-pointer text-base"
            >
              <Link href="/dashboard">
                <span>Go to dashboard</span>
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-250 font-bold px-8 py-6 rounded-xl transition-all duration-200 h-fit cursor-pointer text-base dark:border-gray-200"
            >
              <Link href="/dashboard?add=true">
                <Plus size={18} />
                <span>Add item</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
            <Button
              asChild
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 h-fit cursor-pointer text-base"
            >
              <Link href="/signup">
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-250 font-bold px-8 py-6 rounded-xl transition-all duration-200 h-fit cursor-pointer text-base dark:border-gray-200"
            >
              <Link href="/login">
                <span>Try Live Demo</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Interactive Features Preview Title */}
        <div className="w-full border-t border-gray-100 pt-16 mb-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Designed to keep you organized</h2>
          <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-12">Core Capabilities</p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-gray-150 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div
                    className={`p-2.5 ${feature.bgColor} ${feature.textColor} rounded-xl w-fit border ${feature.borderColor}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base mb-1.5">{feature.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400">
          <div className="flex items-center gap-1.5">
            <Brain size={14} className="text-gray-400" />
            <span>Brain Dump &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-gray-600 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-gray-600 transition-colors">
              Sign Up
            </Link>
            <Link href="/dashboard" className="hover:text-gray-600 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
