import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brain Dump — AI Personal Knowledge Hub",
  description:
    "Save YouTube videos, tweets, Spotify tracks, web links, and notes. Search semantically with Gemini AI and chat with your own knowledge base.",
  icons: {
    icon: "logo.png",
    apple: "logo.png",
  },
  metadataBase: new URL("https://dump.aftercp.com"),
  keywords: [
    "knowledge management",
    "AI notes",
    "semantic search",
    "RAG",
    "Gemini AI",
    "personal knowledge base",
    "brain dump",
  ],
  authors: [{ name: "Mankesh", url: "https://github.com/mankesh016" }],
  openGraph: {
    title: "Brain Dump — AI Personal Knowledge Hub",
    description: "Your digital mind, supercharged by Gemini AI. Save anything, find everything.",
    url: "https://dump.aftercp.com",
    siteName: "Brain Dump",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
