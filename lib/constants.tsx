import { Brain, FileText } from "lucide-react";
import React from "react";

export function YoutubeIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.543 6.498C22 8.249 22 12 22 12s0 3.751-.457 5.502c-.254.985-.997 1.76-1.948 2.022C17.83 20 12 20 12 20s-5.83 0-7.595-.476c-.951-.262-1.694-1.037-1.948-2.022C2 15.751 2 12 2 12s0-3.751.457-5.502c.254-.985.997-1.76 1.948-2.022C6.17 4 12 4 12 4s5.83 0 7.595.476c.951.262 1.694 1.037 1.948 2.022zM9.545 15.568L15.818 12l-6.273-3.568v7.136z" />
    </svg>
  );
}

export function LinkedinIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export function TwitterIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SpotifyIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.784-8.894-.982-.336.076-.67-.135-.746-.472-.076-.336.135-.67.472-.746 3.854-.878 7.15-.497 9.822 1.137.295.18.387.565.206.86zm1.226-2.721c-.19.29-.57.38-.86.19-2.03-1.25-5.11-1.61-7.5-1.18-.32.06-.63-.16-.69-.48-.06-.32.16-.63.48-.69 2.73-.49 6.13-.09 8.49 1.36.29.18.38.56.18.8zM17.95 10.7c-3.23-1.92-8.58-2.1-11.69-1.15-.5.15-.99-.13-1.14-.62-.15-.5.13-.99.62-1.14 3.59-1.09 9.49-.89 13.21 1.32.45.27.6.84.33 1.29-.27.45-.84.6-1.29.33z" />
    </svg>
  );
}

export function LinkIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9.88 18.36a3 3 0 0 1-4.24 0 3 3 0 0 1 0-4.24l2.83-2.83-1.41-1.41-2.83 2.83a5.003 5.003 0 0 0 0 7.07c.98.97 2.25 1.46 3.54 1.46s2.56-.49 3.54-1.46l2.83-2.83-1.41-1.41-2.83 2.83Zm2.83-14.14L9.88 7.05l1.41 1.41 2.83-2.83a3 3 0 0 1 4.24 0 3 3 0 0 1 0 4.24l-2.83 2.83 1.41 1.41 2.83-2.83a5.003 5.003 0 0 0 0-7.07 5.003 5.003 0 0 0-7.07 0Z"></path>
      <path d="m16.95 8.46-.71-.7-.7-.71-4.25 4.24-4.24 4.25.71.7.7.71 4.25-4.24z"></path>
    </svg>
  );
}

export const SIDEBAR_ITEMS = [
  { name: "All Brains", filter: "all", icon: Brain },
  { name: "Notes", filter: "NOTE", icon: FileText },
  { name: "YouTube", filter: "YOUTUBE", icon: YoutubeIcon },
  { name: "Twitter", filter: "TWITTER", icon: TwitterIcon },
  { name: "LinkedIn", filter: "LINKEDIN", icon: LinkedinIcon },
  { name: "Spotify", filter: "SPOTIFY", icon: SpotifyIcon },
  { name: "Web Links", filter: "WEBLINK", icon: LinkIcon },
];

export const CARD_THEMES: Record<string, { border: string; tagClass: string; iconColor: string; iconBg: string }> = {
  NOTE: {
    border: "border-t-[2px] border-t-amber-500",
    tagClass: "bg-amber-50 border-amber-200 text-amber-700",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
  },
  YOUTUBE: {
    border: "border-t-[2px] border-t-red-500",
    tagClass: "bg-red-50 border-red-200 text-red-700",
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
  },
  TWITTER: {
    border: "border-t-[2px] border-t-black",
    tagClass: "bg-gray-50 border-gray-200 text-gray-900",
    iconColor: "text-black",
    iconBg: "bg-gray-100",
  },
  LINKEDIN: {
    border: "border-t-[2px] border-t-sky-400",
    tagClass: "bg-sky-50 border-sky-200 text-sky-700",
    iconColor: "text-sky-500",
    iconBg: "bg-sky-50",
  },
  SPOTIFY: {
    border: "border-t-[2px] border-t-green-500",
    tagClass: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
  },
  WEBLINK: {
    border: "border-t-[2px] border-t-blue-600",
    tagClass: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
};
