'use client';

import { useState, useEffect } from 'react';

interface Heading {
    id: string;
    text: string;
    level: number;
    top: number;
}

interface PostSideNavigatorProps {
    contentSelector: string;
}

export default function PostSideNavigator({ contentSelector }: PostSideNavigatorProps) {
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

    const ensureHeadingId = (headingElement: HTMLHeadingElement): string => {
        if (headingElement.id) {
            return headingElement.id;
        }
        const slug = (headingElement.textContent || '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
        let uniqueSlug = slug;
        let counter = 1;
        while (document.getElementById(uniqueSlug)) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }
        headingElement.id = uniqueSlug;
        return uniqueSlug;
    };

    useEffect(() => {
        const contentElement = document.querySelector(contentSelector);

        if (!contentElement) {
            console.warn(`PostSideNavigator: Content element with selector "${contentSelector}" not found.`);
            setHeadings([]);
            return;
        }

        const headingElements = Array.from(
            contentElement.querySelectorAll<HTMLHeadingElement>('h1, h2, h3')
        );

        const extractedHeadings = headingElements.map((el) => {
            const id = ensureHeadingId(el);
            const rect = el.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            return {
                id: id,
                text: el.innerText,
                level: parseInt(el.tagName.substring(1), 10),
                top: rect.top + scrollTop,
            };
        });

        setHeadings(extractedHeadings);
    }, [contentSelector]);

    const handleScroll = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollY = window.scrollY;
        const scrollableHeight = documentHeight - windowHeight;

        if (scrollableHeight <= 0) {
            setScrollPercentage(0);
        } else {
            const currentPercentage = (scrollY / scrollableHeight) * 100;
            setScrollPercentage(Math.min(100, Math.max(0, currentPercentage)));
        }

        let currentActiveHeadingId: string | null = null;
        const scrollOffset = scrollY + windowHeight * 0.25;

        for (let i = headings.length - 1; i >= 0; i--) {
            if (scrollOffset >= headings[i].top) {
                currentActiveHeadingId = headings[i].id;
                break;
            }
        }
        setActiveHeadingId(currentActiveHeadingId);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [headings]);

    const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const getIndentClass = (level: number) => {
        switch (level) {
            case 1: return 'pl-0';
            case 2: return 'pl-3';
            case 3: return 'pl-6';
            default: return 'pl-0';
        }
    };

    return (
        <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-48 z-50 hidden lg:block px-4 py-4 pointer-events-auto">
            <div className="relative h-full">
                <div className="absolute top-0 left-0 w-1 h-50 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                        className="w-full bg-primary dark:bg-primary-light rounded-full transition-[height] duration-100 ease-linear"
                        style={{ height: `${scrollPercentage}%` }}
                    />
                </div>
                <nav className="absolute top-0 left-4 h-full overflow-y-auto scrollbar-hide w-[calc(100%-1rem)]">
                    <ul className="text-sm">
                        {headings.map((heading) => (
                            <li key={heading.id} className={`mb-1 ${getIndentClass(heading.level)}`}>
                                <a
                                    href={`#${heading.id}`}
                                    onClick={(e) => scrollToHeading(e, heading.id)}
                                    className={`block truncate transition-colors duration-150 ease-in-out ${activeHeadingId === heading.id
                                            ? 'text-primary dark:text-primary-light font-semibold'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}
                                    title={heading.text}
                                >
                                    {heading.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
}
