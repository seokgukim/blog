import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTopButton from '@/components/BackToTopButton';
import LoadKatex from "@/components/LoadKatex";
import Script from 'next/script'; // Import the Script component

export const metadata: Metadata = {
  title: "SeokguKim's Garage",
  description: "A personal blog by SeokguKim",
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID; // Read the ID

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
      <body>
        {/* Google Analytics Scripts */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
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
