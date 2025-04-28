"use client"

import Script from 'next/script'
import { useState, useEffect } from 'react'; // Import useState and useEffect

export default function LoadKatex() {

  const [isKatexLoaded, setIsKatexLoaded] = useState(false);

  const renderMath = () => {
    if (window.renderMathInElement) {
      console.log('Rendering KaTeX...'); // Optional: for debugging
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    } else {
      console.error("renderMathInElement not found. KaTeX auto-render script might not have loaded correctly.");
    }
  };

  useEffect(() => {
    if (isKatexLoaded) { // Only attempt render if core is loaded
      renderMath();
    }
  }, [isKatexLoaded, renderMath]); // Re-run if isKatexLoaded changes


  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css"
        integrity="sha384-5TcZemv2l/9On385z///+d7MSYlvIEw9FuZTIdZ14vJLqWphw7e7ZPuOiCHJcFCP"
        crossOrigin="anonymous" />
      <Script
        defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js"
        integrity="sha384-cMkvdD8LoxVzGF/RPUKAcvmm49FQ0oxwDF3BGKtDXcEc+T1b2N+teh/OJfpU0jr6"
        strategy="afterInteractive" // Load sooner than lazyOnload
        crossOrigin="anonymous" />
      <Script
        defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js" integrity="sha384-hCXGrW6PitJEwbkoStFjeJxv+fSOOQKOPbJxSfM6G5sWZjAyWhXiTIIAmQqnlLlh"
        crossOrigin="anonymous"
        strategy="lazyOnload"
        onLoad={() => setIsKatexLoaded(true)}
        onError={(e) => console.error("Error loading KaTeX auto-render script:", e)}
      />
    </>
  );
}