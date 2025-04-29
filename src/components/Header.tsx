"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';
import React, { useState } from 'react';
import Image from 'next/image';

// Define type for navigation items
interface NavItem {
    href: string;
    label: string;
}

export default function Header() {
  const currentPath = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hardcoded Korean labels based on ko.json
  const navItems: NavItem[] = [
    { href: '/about', label: 'About' }, // From ko.json Header.about
    { href: '/posts', label: 'Posts' }, // From ko.json Header.posts
    { href: '/tags', label: 'Tags' }, // From ko.json Header.tags
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // import seokgukims-garage/public/logo.svg
  


  return (
    <header className="bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-dark-foreground transition-colors duration-300 ease-in-out">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo/Brand */}
          <div className="flex-shrink-0">
             {/* Added animation classes */}
             <Link href={`/`} className="flex items-center hover:opacity-80 duration-200 active:scale-95 transition-transform ease-in-out"> {/* Removed locale */}
               <Image
                 src="/logo.svg"
                 alt="Seokgukim's Garage"
                 className="h-8 w-auto"
                 priority
               />
             </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden sm:flex sm:ml-6 sm:space-x-4">
            {navItems.map((item) => {
              // Determine if the link is active
              const isActive = item.href === '/'
                ? currentPath === '/'
                // Adjusted path checking for non-locale structure
                : currentPath === item.href || currentPath.startsWith(item.href + '/');
              const linkHref = item.href; // Removed locale segment

              return (
                <Link
                  key={item.href}
                  href={linkHref}
                  // Added animation classes
                  className={`rounded-md px-3 py-2 text-sm font-medium duration-200 ease-in-out active:scale-95 transition-transform ${
                    isActive
                      ? 'bg-accent dark:bg-accent-dark text-accent-foreground dark:text-accent-dark-foreground' // Active link style with dark mode
                      : 'text-primary-foreground/80 dark:text-primary-dark-foreground/80 hover:text-primary-foreground dark:hover:text-primary-dark-foreground hover:bg-accent/20 dark:hover:bg-accent-dark/20' // Inactive link style with dark mode
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: Controls (Language/Theme) */}
          <div className="hidden sm:flex sm:ml-6 sm:items-center sm:space-x-2">
             <ThemeSwitcher />
          </div>

          {/* Mobile menu button and switchers */}
          <div className="flex items-center sm:hidden">
            <div className="flex items-center space-x-1 mr-2">
                <ThemeSwitcher />
            </div>
            <button
              type="button"
              onClick={toggleMobileMenu}
              // Added animation classes
              className="relative inline-flex items-center justify-center rounded-md p-2 text-primary-foreground/80 dark:text-primary-dark-foreground/80 hover:bg-accent/20 dark:hover:bg-accent-dark/20 hover:text-primary-foreground dark:hover:text-primary-dark-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white duration-200 ease-in-out active:scale-95 transition-transform"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`sm:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`} id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => {
               const isActive = item.href === '/'
                 ? currentPath === '/'
                 // Adjusted path checking for non-locale structure
                 : currentPath === item.href || currentPath.startsWith(item.href + '/');
               const linkHref = item.href; // Removed locale segment

               return (
                 <Link
                   key={item.href}
                   href={linkHref}
                   onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                   // Added animation classes
                   className={`block rounded-md px-3 py-2 text-base font-medium duration-200 ease-in-out active:scale-95 transition-transform ${
                     isActive
                       ? 'bg-accent dark:bg-accent-dark text-accent-foreground dark:text-accent-dark-foreground' // Active link style with dark mode
                       : 'text-primary-foreground/80 dark:text-primary-dark-foreground/80 hover:text-primary-foreground dark:hover:text-primary-dark-foreground hover:bg-accent/20 dark:hover:bg-accent-dark/20' // Inactive link style with dark mode
                   }`}
                   aria-current={isActive ? 'page' : undefined}
                 >
                   {item.label}
                 </Link>
               );
             })}
          </div>
        </div>
      </nav>
    </header>
  );
}