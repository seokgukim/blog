import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from '@/components/Header'; // Use Header instead of Navbar if that's the correct name

export const metadata: Metadata = {
  title: "Seokgu Kim's Garage",
  description: "A personal blog by SeokguKim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`font-sans bg-background-light dark:bg-background-dark antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="flex flex-col min-h-screen"> {/* Apply flex structure here */}
            <Header /> {/* Use the correct Header component */}
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="text-center py-4 text-muted-light dark:text-muted-dark text-sm">
              © {new Date().getFullYear()} SeokguKim
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
