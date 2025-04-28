'use client'

import { useState, useEffect } from 'react'

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) { // Show button after scrolling 300px
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Scroll smoothly to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      // Apply Tailwind classes for styling, positioning, and transitions
      className={`
        fixed bottom-8 right-8 z-50 p-3 rounded-full
        bg-primary text-primary-foreground // Use your theme's primary colors
        shadow-lg hover:bg-primary/90 // Add hover effect
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        focus:ring-offset-background-light dark:focus:ring-offset-background-dark // Adjust offset color for dark mode
        transition-opacity duration-300 ease-in-out // Fade transition
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} // Show/hide based on state
      `}
      aria-label="Scroll back to top"
    >
      {/* Simple Arrow Up Icon (You can replace with an SVG icon if preferred) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  )
}