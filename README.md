# 🧠 Brain Dump

Brain Dump is an AI-powered personal knowledge management tool that transforms digital clutter into an interactive, highly searchable repository. It allows users to seamlessly store notes, links, and bookmarks, and ensures they are never lost again. By integrating advanced semantic search and a conversational AI assistant, users can query their own curated data in plain English, instantly retrieving contextual insights without relying on exact keyword matches.

**Live demo → [dump.aftercp.com](https://dump.aftercp.com)**  
Username: `testuser` · Password: `testpass`

---

## Features

- **Save anything** — YouTube videos, tweets, Spotify tracks, LinkedIn posts, web links, personal notes
- **Dual search** — keyword search (fast, exact) and AI semantic search (intent-based, finds meaning not just words)
- **AI autogenerate tags** — Gemini suggests relevant tags from your title, content, or URL
- **Generate title** — paste a URL, auto-fetch the page title
- **RAG-powered AI chat** — ask questions in natural language, get answers synthesized from your saved items
- **Dark / Light theme** — persists across sessions
- **One-click demo access** — no signup needed to explore

---

## Tech Stack

| Layer         | Technology                                            |
| ------------- | ----------------------------------------------------- |
| Framework     | Next.js 16, TypeScript                                |
| Styling       | Tailwind CSS, shadcn/ui                               |
| ORM           | Prisma                                                |
| Database      | PostgreSQL on Neon                                    |
| Vector Search | pgvector (cosine similarity)                          |
| AI            | Gemini API (`gemini-embedding-2`, `gemini-2.5-flash`) |
| Auth          | NextAuth.js (credentials)                             |
| Deployment    | Vercel                                                |

---

## How Semantic Search Works

Every saved item triggers an embedding pipeline:

```
Save item → gemini-embedding-2 → 768-dim vector → stored in pgvector
```

On search:

```
User query → embed query → cosine similarity against all stored vectors → ranked results
```

Because search works on meaning rather than exact words:

- Searching **"hot"** surfaces notes about tea, summer, and spicy food — not just items containing the word "hot"
- Searching **"drink"** surfaces tea, coffee, and water — even if your notes just say "morning cup" or "stay hydrated"

---

## Local Setup

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL with pgvector)

### Steps

```bash
git clone https://github.com/mankesh016/brain-dump.git
cd brain-dump
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Start the local database (pgvector pre-installed):

```bash
docker compose up -d
```

Run migrations and seed the dev user:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```env
DATABASE_URL=           # PostgreSQL connection string
GEMINI_API_KEY=         # Google AI Studio API key
NEXTAUTH_SECRET=        # Random string: openssl rand -base64 32
NEXTAUTH_URL=           # http://localhost:3000 (local) or your deployed URL
DEV_USER_ID=            # dev-user-123 (only used in local dev)
```

---

## Project Structure

```
brain-dump/
├── app/
│   ├── api/
│   │   ├── items/          # CRUD for saved items
│   │   ├── search/         # Keyword + semantic search
│   │   ├── embed/          # Embedding pipeline (called on item save)
│   │   ├── chat/           # RAG chat endpoint (streaming)
│   │   ├── tags/generate/  # AI tag generation
│   │   └── meta/           # Fetch page title from URL
│   ├── dashboard/          # Main app
│   ├── login/              # Sign in page
│   └── signup/             # Sign up page
├── components/
│   └── dashboard/          # Sidebar, ItemCard, AddDialog, ChatSidebar, etc.
├── lib/
│   ├── db.ts               # Prisma client
│   ├── gemini.ts           # Gemini embed + RAG chat
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Shared utilities
├── prisma/
│   └── schema.prisma
└── docker-compose.yml      # Local pgvector setup
```

---

## Database Schema

```
User
 └── Item (NOTE | YOUTUBE | TWITTER | LINKEDIN | WEBLINK | SPOTIFY)
      ├── ItemTag → Tag
      └── Embedding (768-dim vector)
```

---

## Author

Built by [Mankesh](https://github.com/mankesh016)
