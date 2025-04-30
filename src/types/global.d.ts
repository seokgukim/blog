// Extend the global Window interface
declare global {
  interface Window {
    // Define renderMathInElement as an optional property
    // Replace 'any' with 'unknown' for better type safety
    renderMathInElement?: (element: HTMLElement | Document, options?: unknown) => unknown;
  }
}

// Export {} is needed if you have other types in this file
// to make it a module, otherwise it might be treated as a script.
// If this is the only content, you might not strictly need it,
// but it's good practice.
export {};