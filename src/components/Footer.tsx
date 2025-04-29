export default function Footer() { // Explicit return type
  const currentYear: number = new Date().getFullYear();
  return (
    // Use defined border color
    <footer className="mt-12 py-6 border-t border-border-light dark:border-border-dark">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
        © {currentYear} SeokguKim
        {/* Add links to GitHub, etc. if desired */}
      </div>
    </footer>
  );
}