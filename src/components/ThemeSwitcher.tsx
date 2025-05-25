"use client";

import * as React from "react";
import { useTheme } from "next-themes";

// Simple icons (replace with actual icons from a library like lucide-react if desired)
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
);
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Ensure component is mounted before rendering UI to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a placeholder or null during server rendering and hydration
        return <div className="w-8 h-8"></div>; // Placeholder with same size as button
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            // Added animation classes (combined with existing transition)
            className="p-2 rounded-md text-primary-foreground/80 dark:text-primary-dark-foreground/80 hover:bg-accent/20 dark:hover:bg-accent-dark/20 hover:text-primary-foreground dark:hover:text-primary-dark-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-transform duration-100 ease-in-out active:scale-95"
        >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
    );
}