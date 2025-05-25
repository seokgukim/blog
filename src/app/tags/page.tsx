import Link from 'next/link';
import { getAllTagsMinio } from 'lib/posts_minio';

export default async function TagsPage() {
    const title = "Tags"; // From ko.json TagsPage.title
    const subtitle = "태그별로 포스트를 찾아보세요"; // From ko.json TagsPage.subtitle
    const noTagsFound = "아직 태그가 없습니다."; // From ko.json TagsPage.noTagsFound

    const allTags: string[] = await getAllTagsMinio(); // Fetch all unique tags

    // Sort tags alphabetically
    allTags.sort((a, b) => a.localeCompare(b));

    return (
        <section>
            <h1 className="text-3xl font-bold mb-4 text-foreground-light dark:text-foreground-dark">
                {title}
            </h1>
            <p className="text-lg text-muted-light dark:text-muted-dark mb-8">
                {subtitle}
            </p>

            {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {allTags.map((tag) => (
                        <Link
                            key={tag}
                            href={`/tags/${encodeURIComponent(tag)}`} // Removed locale segment
                            // Added hover:scale-105 and adjusted transition
                            className="inline-block bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary/30 px-4 py-2 rounded-full text-sm font-medium active:scale-95 hover:scale-105 transition-all duration-150 ease-in-out"
                        >
                            #{tag}
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-muted-light dark:text-muted-dark">{noTagsFound}</p>
            )}
        </section>
    );
}