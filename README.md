# :notebook: SeokguKim's Blog

SeokguKim's blog repository.

이 곳은 김석구의 블로그 레포지토리입니다.

![Symbol_SeokguKim](https://github.com/SeokguKim/seokgukim.github.io/assets/43718966/187cd9b3-94ef-4661-bf2f-abc1a2503b90)

## Overview

- App Router 기반 Next.js 16 프로젝트, Turbopack 개발 서버, Tailwind CSS 4, TypeScript 5.9, ESLint 9.
- Markdown 파이프라인은 remark/rehype + shiki + KaTeX로 구성되어 수식, 표, 코드 블록을 모두 지원합니다.
- 기본적으로 `content/posts`의 로컬 마크다운을 읽고, 필요 시 `lib/posts_minio.ts`로 MinIO 객체 스토리지를 사용할 수 있습니다.

## Features

- 🔥 **Modern stack** – React 19 + Next.js 16 App Router, Suspense-ready data loading, streaming UI.
- 🌓 **Persistent theme toggle** with `next-themes` & custom `ThemeProvider`/`ThemeSwitcher` components.
- 🧮 **Math + code friendly writing** via remark-math, rehype-katex, rehype-pretty-code (Shiki) and GitHub-flavored Markdown.
- 🏷️ **Tag-aware navigation** (`/tags`, `/tags/[tag]`) and post detail routes (`/posts/[slug]`).
- ☁️ **Object storage ready** – optional MinIO integration for remote post hosting and asset delivery.
- 🐳 **Dockerfile included** for reproducible deployments alongside the usual `pnpm build && pnpm start` flow.

## Tech Stack

| Layer     | Tooling                                                                       |
| --------- | ----------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router) + React 19                                            |
| Language  | TypeScript 5.9                                                                |
| Styling   | Tailwind CSS 4, PostCSS, Autoprefixer                                         |
| Content   | Markdown + remark/rehype + shiki prettifier + KaTeX                           |
| State/UX  | next-themes, custom components (`PostSideNavigator`, `BackToTopButton`, etc.) |
| Tooling   | pnpm 10, ESLint 9, Turbopack dev server                                       |

## Prerequisites

- **Node.js ≥ 20** (Next.js 16 officially supports Node 18.18+, recommend latest LTS 20+).
- **pnpm 10** (lockfile generated with `pnpm@10.9.0`). Install via `corepack enable` or `npm install -g pnpm`.
- (Optional) **Docker** and **MinIO** when running the object-storage pipeline.

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/SeokguKim/blog.git
   cd blog
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy environment variables and fill them in:
   ```bash
   cp .env.example .env
   ```
4. Start the dev server (Turbopack):
   ```bash
   pnpm dev
   ```
   The app runs at http://localhost:3000.

### Available Scripts

| Command      | Description                                               |
| ------------ | --------------------------------------------------------- |
| `pnpm dev`   | Start Next.js in development mode with Turbopack.         |
| `pnpm build` | Create an optimized production build.                     |
| `pnpm start` | Serve the production build (requires `pnpm build` first). |
| `pnpm lint`  | Run ESLint using `next lint`.                             |

## Environment Variables

Keep `.env` in sync with `.env.example` and never commit secrets.

| Key                                             | Purpose                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_GA_ID`                             | Google Analytics measurement ID exposed to the client.                |
| `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL` | Connection settings for the MinIO cluster hosting Markdown or assets. |
| `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`          | Credentials for MinIO (store secure values locally/CI secrets).       |
| `MINIO_BUCKET_NAME`, `MINIO_POSTS_PREFIX`       | Bucket + prefix that contain blog posts and related files.            |

Sync tip:

```bash
cp .env.example .env
# later, see what changed
git --no-pager diff --no-index -- .env.example .env || true
```

## Writing Content

1. Create Markdown files inside `content/posts` (add the folder if it does not exist).
2. Use the required frontmatter:

   ```markdown
   ---
   title: "My First Post"
   date: "2025-01-15"
   tags:
     - nextjs
     - life
   ---

   Your content here – supports tables, math ($E=mc^2$), and fenced code blocks.
   ```

3. Assets can live under `public/` or in your MinIO bucket referenced via absolute URLs.

## Project Structure

```
blog/
├── content/
│   ├── about.md
│   └── posts/                # Markdown sources (create per post)
├── lib/
│   ├── posts.ts              # Local filesystem markdown pipeline
│   └── posts_minio.ts        # Alternative MinIO-backed loader
├── public/                   # Static assets served by Next.js
├── src/
│   ├── app/                  # App Router routes (home, about, posts, tags)
│   ├── components/           # UI components (Header, Footer, PostItem...)
│   └── types/                # Global TS types
├── tailwind.config.ts        # Tailwind 4 config
├── eslint.config.mjs         # ESLint 9 flat config
├── dockerfile                # Production container definition
├── pnpm-lock.yaml / pnpm-workspace.yaml
└── README.md
```

## Deployment

### Traditional

```bash
pnpm build
pnpm start -- --hostname 0.0.0.0 --port 3000
```

Pass production env vars via `.env`, `process.env`, or your hosting provider's secret manager.

### Docker

```bash
docker build -t seokgukim/blog .
docker run --env-file .env -p 3000:3000 seokgukim/blog
```

Use the same `.env` file (without secrets committed) or inject values through your orchestrator (Kubernetes, ECS, etc.).
