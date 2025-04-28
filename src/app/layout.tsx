import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTopButton from '@/components/BackToTopButton';
import LoadKatex from "@/components/LoadKatex";

export const metadata: Metadata = {
  title: "SeokguKim's Garage",
  description: "A personal blog by SeokguKim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <LoadKatex /> 
      </head>
      <body className={`font-sans bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <BackToTopButton />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
