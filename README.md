# :notebook: SeokguKim's Blog

This is blog SeokguKim's blog repository.

이 곳은 김석구의 블로그 리포지토리입니다.

![Symbol_SeokguKim](https://github.com/SeokguKim/seokgukim.github.io/assets/43718966/187cd9b3-94ef-4661-bf2f-abc1a2503b90)

## Structure

```
.
├── content/                  # Store markdown posts here
│   └── posts/
│       ├── my-blog-post.md
│       └── another-post.md
├── lib/                      # Utility functions
│   └── posts.ts              # Functions to read/parse posts
├── public/                   # Static assets (keep existing)
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Locale-specific layout
│   │   ├── page.tsx      # Home page
│   │   ├── about/
│   │   │   └── page.tsx  # About page
│   │   ├── posts/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx # Single post page
│   │   │   └── page.tsx     # Post listing page (optional)
│   │   └── tags/
│   │   │   └── [tag]/
│   │   │           └── page.tsx # Tag archive page
│   │   ├── favicon.ico      
│   │   ├── globals.css       
│   │   └── layout.tsx        # Root layout (minimal)
│   ├── components/           # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PostItem.tsx
│   │   ├── Card.tsx
│   │   ├── ThemeSwitcher
│   │   └── ThemeProvider.tsx
│   └── middleware.ts         # next-intl middleware
│   └── i18n.ts               # next-intl configuration
├── .gitignore                
├── eslint.config.mjs         
├── next-env.d.ts             
├── next.config.ts           
├── package.json              
├── pnpm-lock.yaml           
├── postcss.config.mjs        
├── README.md                 
└── tsconfig.json             
```