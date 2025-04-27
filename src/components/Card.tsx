import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    // Use theme-aware background and border colors
    <div className={`bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden border border-border-light dark:border-border-dark hover:shadow-lg transition-shadow ${className}`}>
      {children}
    </div>
  );
}

// Optional: Card Content sub-component for consistent padding
export function CardContent({ children, className = '' }: CardProps) {
    return <div className={`p-4 ${className}`}>{children}</div>;
}