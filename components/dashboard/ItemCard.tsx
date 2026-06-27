import { CARD_THEMES, SIDEBAR_ITEMS } from "@/lib/constants";
import { ExternalLink, FileText, Pencil, Trash2 } from "lucide-react";

interface ItemCardProps {
  item: any;
}
export function ItemCard({ item }: ItemCardProps) {
  const theme = CARD_THEMES[item.type] || CARD_THEMES.NOTE;
  const CardIcon = SIDEBAR_ITEMS.find((s) => s.filter === item.type)?.icon || FileText;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB"); // DD/MM/YYYY
  }

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
      </div>
    </div>
  );
}
