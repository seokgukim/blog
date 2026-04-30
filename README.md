# :notebook: SeokguKim's Blog

SeokguKim's blog repository.

이 곳은 김석구의 블로그 레포지토리입니다.

![Symbol_SeokguKim](https://github.com/SeokguKim/seokgukim.github.io/assets/43718966/187cd9b3-94ef-4661-bf2f-abc1a2503b90)

## Overview

- App Router 기반 Next.js 16 프로젝트, Turbopack 개발 서버, Tailwind CSS 4, TypeScript 5.9, ESLint 9.
- Markdown 파이프라인은 remark/rehype + shiki + KaTeX로 구성되어 수식, 표, 코드 블록을 모두 지원합니다.
- 로컬 `content/posts` 또는 공개 R2/S3 호환 엔드포인트의 `/blog/posts/*.md` 마크다운을 빌드 시 읽고, Cloudflare Pages용 정적 HTML을 생성합니다.

## Features

- 🔥 **Modern stack** – React 19 + Next.js 16 App Router, Suspense-ready data loading, streaming UI.
- 🌓 **Persistent theme toggle** with `next-themes` & custom `ThemeProvider`/`ThemeSwitcher` components.
- 🧮 **Math + code friendly writing** via remark-math, rehype-katex, rehype-pretty-code (Shiki) and GitHub-flavored Markdown.
- 🏷️ **Tag-aware navigation** (`/tags`, `/tags/[tag]`) and post detail routes (`/posts/[slug]`).
- ☁️ **R2/S3 content source** – reads Markdown from a configured public endpoint, or local `content/posts` when no endpoint is set.
- 🚀 **Cloudflare Pages deployment** – `wrangler.toml` and pnpm scripts target the `out/` static export.
- 🐳 **Dockerfile included** for serving the same static export through nginx.

## Tech Stack

| Layer     | Tooling                                                                       |
| --------- | ----------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router) + React 19                                            |
| Language  | TypeScript 5.9                                                                |
| Styling   | Tailwind CSS 4, PostCSS                                                       |
| Content   | Markdown + remark/rehype + shiki prettifier + KaTeX                           |
| State/UX  | next-themes, custom components (`PostSideNavigator`, `BackToTopButton`, etc.) |
| Tooling   | pnpm 10, ESLint 9, Turbopack dev server                                       |

## Prerequisites

- **Node.js ≥ 20.9** (Next.js 16 requirement; CI uses Node.js 24).
- **pnpm 10** (lockfile generated with `pnpm@10.33.2`). Install via `corepack enable` or `npm install -g pnpm`.

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
| `pnpm lint`  | Run ESLint.                                               |
| `pnpm pages:preview` | Build and preview `out/` with local Wrangler.      |
| `pnpm pages:deploy`  | Build and deploy `out/` with local Wrangler.       |
| `pnpm content:dev`   | Run the R2-backed content source Worker locally.   |
| `pnpm content:deploy` | Deploy the R2-backed content source Worker.       |

## Environment Variables

Keep `.env` in sync with `.env.example` and never commit secrets.

| Key                  | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_GA_ID`  | Google Analytics measurement ID exposed to the client.         |
| `S3_PUBLIC_ENDPOINT` | Public R2/S3-compatible endpoint. Leave unset to build from local `content/posts`. |
| `S3_BLOG_PATH`       | Blog content subpath on the public endpoint. Defaults to `/blog`. |
| `S3_POST_DISCOVERY`  | Post discovery method: `manifest` for the included R2 Worker-generated manifest endpoint, `list` for public S3 ListBucket, or `auto`. Defaults to `manifest`. |

Sync tip:

```bash
cp .env.example .env
# later, see what changed
git --no-pager diff --no-index -- .env.example .env || true
```

## Writing Content

1. For local-only builds, place Markdown files under `content/posts/`. For R2/S3-backed builds, publish Markdown files directly under `${S3_PUBLIC_ENDPOINT}${S3_BLOG_PATH}/posts/`.
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

3. Make the post list discoverable by deploying the included R2 content source Worker, which generates `${S3_PUBLIC_ENDPOINT}${S3_BLOG_PATH}/posts/index.json` dynamically. You only need to publish a static `posts/index.json` yourself if you are not using the Worker, or set `S3_POST_DISCOVERY=list` for endpoints that support public S3 `ListBucket`:

   ```json
   ["my-first-post.md"]
   ```

4. Assets can live under `public/` or in the public S3 path referenced via absolute URLs.

### Obsidian remote sync + R2

If Obsidian remote sync uploads Markdown directly to R2, do not maintain `posts/index.json` by hand. Deploy `cloudflare/content-source-worker.js` on the custom domain used by `S3_PUBLIC_ENDPOINT` (for example, `s3.seokgukim.com`) and keep `S3_POST_DISCOVERY=manifest`. The Worker returns a dynamic manifest at `/blog/posts/index.json` by listing R2 objects under `blog/posts/`, and proxies the Markdown objects themselves.

Configure `cloudflare/content-source.wrangler.toml` with the R2 bucket name, then deploy:

```bash
pnpm content:deploy
```

The default Worker config binds the route `s3.seokgukim.com/blog/*` in the Cloudflare zone `seokgukim.com`, disables the extra `workers.dev` endpoint, and binds the `blog` R2 bucket as `BLOG_BUCKET`. Adjust `routes`, `bucket_name`, and `BLOG_PREFIX` if the domain, R2 bucket, or synced key prefix differs. `BLOG_PREFIX=blog` must match `S3_BLOG_PATH=/blog`.

With the default Worker config, Obsidian only needs to sync files like:

```text
blog/posts/my-first-post.md
blog/posts/another-post.md
```

The blog build will read:

```text
https://s3.seokgukim.com/blog/posts/index.json
https://s3.seokgukim.com/blog/posts/my-first-post.md
```

## Project Structure

```
blog/
├── .github/
│   └── workflows/ci.yml      # CI checks and mock public-S3 static export
├── cloudflare/
│   ├── content-source-worker.js          # R2-backed content endpoint
│   └── content-source.wrangler.toml      # Worker route and R2 binding
├── content/
│   └── about.md              # Local About page Markdown
├── lib/
│   ├── posts.ts              # Local filesystem markdown pipeline
│   └── posts_s3.ts           # Public S3-backed post loader
├── public/                   # Static assets served by Next.js
├── src/
│   ├── app/                  # App Router routes (home, about, posts, tags)
│   ├── components/           # UI components (Header, Footer, PostItem...)
│   └── types/                # Global TS types
├── tailwind.config.ts        # Tailwind 4 config
├── eslint.config.mjs         # ESLint 9 flat config
├── wrangler.toml             # Cloudflare Pages output config
├── dockerfile                # Production container definition
├── pnpm-lock.yaml / pnpm-workspace.yaml
└── README.md
```

## Deployment

### Cloudflare Pages

Cloudflare Pages can build directly from the GitHub repository.

Use these settings:

| Setting          | Value        |
| ---------------- | ------------ |
| Build command    | `pnpm build` |
| Build output dir | `out`        |
| Node.js version  | `24`         |

Set Cloudflare Pages environment variables for R2-backed production builds:

| Variable             | Recommended value          |
| -------------------- | -------------------------- |
| `S3_PUBLIC_ENDPOINT` | `https://s3.seokgukim.com` |
| `S3_BLOG_PATH`       | `/blog`                    |
| `S3_POST_DISCOVERY`  | `manifest`                 |
| `NEXT_PUBLIC_GA_ID`  | unset                      |

Cloudflare Pages fetches posts at build time, so R2/Obsidian sync alone does not update the published site. Trigger a Pages rebuild after content sync, for example with a Cloudflare Pages deploy hook or a manual `pnpm pages:deploy`.

Wrangler is installed as a project dev dependency, so no global install is required:

```bash
pnpm pages:preview
pnpm pages:deploy
```

### Docker

```bash
docker build -t seokgukim/blog .
docker run --rm -p 8080:80 seokgukim/blog
```

Build args can override the public content source:

```bash
docker build \
  --build-arg S3_PUBLIC_ENDPOINT=https://s3.seokgukim.com \
  --build-arg S3_BLOG_PATH=/blog \
  -t seokgukim/blog .
```
