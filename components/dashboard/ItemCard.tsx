import { CARD_THEMES, SIDEBAR_ITEMS } from "@/lib/constants";
import { ExternalLink, FileText, Pencil, Trash2 } from "lucide-react";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s?]+)/);
  return match?.[1] ?? null;
}

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
interface ItemCardProps {
  item: any;
  onEdit: (item: any) => void;
  onDeleteTrigger: (id: string) => void;
}
export function ItemCard({ item, onEdit, onDeleteTrigger }: ItemCardProps) {
  const theme = CARD_THEMES[item.type] || CARD_THEMES.NOTE;
  const CardIcon = SIDEBAR_ITEMS.find((s) => s.filter === item.type)?.icon || FileText;

  const isEdited = new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime() > 60000;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB"); // DD/MM/YYYY
  }

  const isYouTube = item.type === "YOUTUBE";
  const videoId = isYouTube && item.url ? getYouTubeId(item.url) : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  const hostname = !isYouTube && item.url ? getHostname(item.url) : null;

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
          <strong className="text-sm font-bold text-gray-800 leading-snug line-clamp-1">{item.title}</strong>
        </div>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-1.5 text-gray-400">
          <button onClick={() => onEdit(item)} className="hover:text-gray-600 p-0.5 transition-colors cursor-pointer">
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDeleteTrigger(item.id)}
            className="hover:text-red-600 p-0.5 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* YouTube Video Thumbnail Preview */}
      {thumbnailUrl && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative rounded-lg overflow-hidden group cursor-pointer border border-gray-100 block"
        >
          <img src={thumbnailUrl} alt="YouTube Thumbnail" className="w-full h-auto object-cover" />
        </a>
      )}

      {/* Hostname Link for other types */}
      {hostname && (
        <div className="flex">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <ExternalLink size={11} className="text-gray-400" />
            <span>{hostname}</span>
          </a>
        </div>
      )}

      {/* Content Preview */}
      {item.content && (
        <p className="text-gray-600 text-xs leading-relaxed line-clamp-4 whitespace-pre-line">{item.content}</p>
      )}

      {/* Tags Badges */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {item.tags.map((t: any) => (
            <span key={t.tag.id || t.tag.name} className={`text-[10px] px-2 py-0.5 rounded border ${theme.tagClass}`}>
              #{t.tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Dates at bottom */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
        <span>Added: {formatDate(item.createdAt)}</span>
        {isEdited && (
          <span className="text-blue-500 font-semibold tracking-normal">Edited: {formatDate(item.updatedAt)}</span>
        )}
      </div>
    </div>
  );
}
