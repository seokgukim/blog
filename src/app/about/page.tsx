// Simple static profile page with basic styling
export default function ProfilePage() { // Explicit return type
    return (
        // Use defined card/border colors
        <section className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark shadow-sm">
            <h1 className="text-3xl font-bold mb-4 text-foreground-light dark:text-foreground-dark">My Profile</h1>
            <p className="mb-4">
                별거 아닌 프로필 페이지입니다. <br />
            </p>
            {/* Example content */}
            <div className="mt-6 border-t border-border-light dark:border-border-dark pt-4">
                <h2 className="text-xl font-semibold mb-2 text-foreground-light dark:text-foreground-dark">Contact</h2>
                {/* Use defined primary-muted color */}
                <a href="mailto:your-email@example.com" className="text-primary-muted hover:underline">
                    rokja97@naver.com
                </a>
            </div>
        </section>
    );
}