# :notebook: SeokguKim's Blog

This is blog SeokguKim's blog repository.

이 곳은 김석구의 블로그 리포지토리입니다.

![Symbol_SeokguKim](https://github.com/SeokguKim/seokgukim.github.io/assets/43718966/187cd9b3-94ef-4661-bf2f-abc1a2503b90)

## Structure

```
blog/
├── .dockerignore
├── .gitignore
├── dockerfile
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── content/
│   └── about.md
├── lib/
│   ├── posts.ts
│   └── posts_minio.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── logo.svg
│   └── window.svg
└── src/
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── about/
    │   │   └── page.tsx
    │   ├── posts/
    │   │   ├── page.tsx
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   └── tags/
    │       ├── page.tsx
    │       └── [tag]/
    │           └── page.tsx
    ├── components/
    │   ├── BackToTopButton.tsx
    │   ├── Card.tsx
    │   ├── Footer.tsx
    │   ├── Header.tsx
    │   ├── LoadKatex.tsx
    │   ├── MetaData.tsx
    │   ├── PostItem.tsx
    │   ├── PostSideNavigator.tsx
    │   ├── ThemeProvider.tsx
    │   └── ThemeSwitcher.tsx
    └── types/
        └── global.d.ts 
```