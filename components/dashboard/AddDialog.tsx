import axios from "axios";
import { Plus } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface AddDialogProps {
  onAddSuccess: () => void | Promise<void>;
}

export function AddDialog({ onAddSuccess }: AddDialogProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState("NOTE");

  function handleUrlChange(val: string) {
    setUrl(val);
    const detected = detectType(val);
    setType(detected);
  }

  function detectType(urlStr: string): string {
    if (!urlStr) return "NOTE";
    const low = urlStr.toLowerCase();
    if (low.includes("youtube.com") || low.includes("youtu.be")) return "YOUTUBE";
    if (low.includes("twitter.com") || low.includes("x.com")) return "TWITTER";
    if (low.includes("linkedin.com")) return "LINKEDIN";
    return "WEBLINK";
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
      await onAddSuccess(); // fetchItems()
    } catch (error) {
      console.error("Error adding item:", error);
      setAddError("Error adding item");
    } finally {
      setIsAdding(false);
    }
  }

  const canSubmit = !!(url.trim() || title.trim() || content.trim());

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-9 inline-flex items-center justify-center rounded-lg px-3.5 text-sm font-medium shadow-sm cursor-pointer border border-transparent shrink-0">
        <Plus size={16} />
        <span>Add Item</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-105 bg-white">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {/* 1. URL input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">URL</label>
            <Input value={url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://example.com" />
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
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="typescript, webdev, ai" />
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
  );
}
