import { getAllTags, getPostsByTag, PostListItem } from 'lib/posts'; // Import type
import PostItem from '@/components/PostItem';
import type { Metadata } from 'next'; // Import Metadata type
import { notFound } from 'next/navigation'; // Import notFound for tag existence check

// Type definition for page params
interface TagPageParams {
    params: Promise<{
        tag: string;
    }>;
}

// Generate static paths for all tags (no locale needed)
export async function generateStaticParams(): Promise<{ tag: string }[]> {
    const tags: string[] = getAllTags();
    // Need to generate for each locale if not using middleware routing fully
    return tags.map((tag: string) => ({ tag: encodeURIComponent(tag) }));
}

// Add proper type annotation for params
export default async function TagPage({ params }: TagPageParams) {
    const { tag } = await params; // Await the promise to get the tag
    const decodedTag: string = decodeURIComponent(tag);
    const posts: PostListItem[] = getPostsByTag(decodedTag); // Explicit type
    const allTags = getAllTags(); // Get all tags to check existence

    // Check if the tag actually exists
    if (!allTags.includes(decodedTag)) {
        notFound(); // Show 404 if the tag doesn't exist
    }

    // Hardcoded Korean string
    const titlePrefix = "태그에 해당하는 포스트:";
    const noPostsFoundText = "이 태그에 해당하는 포스트가 없습니다.";

    return (
        <section>
            <h1 className="text-3xl font-bold mb-6 text-foreground-light dark:text-foreground-dark">
                {titlePrefix} {/* Hardcoded prefix */}
                <span className="ml-2 text-2xl font-semibold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-3 py-1 rounded-md">
                    #{decodedTag}
                </span>
            </h1>
            {/* Use flex column for post items */}
            <div className="flex flex-col space-y-0"> {/* Adjusted spacing if PostItem has margin */}
                {posts.map((post: PostListItem) => ( // Explicit type
                    // NOTE: Adding hover effects here is basic.
                    // It's better to add them inside the PostItem component itself.
                    <div key={post.slug} className="transition-transform duration-150 ease-in-out hover:translate-x-1">
                        <PostItem
                            slug={post.slug}
                            date={post.date}
                            title={post.title}
                            tags={post.tags}
                        />
                    </div>
                ))}
                {/* Display message if no posts are found */}
                {posts.length === 0 && (
                    <p className="text-muted-light dark:text-muted-dark mt-4">{noPostsFoundText}</p> // Hardcoded text
                )}
            </div>
        </section>
    );
}

// Generate metadata with proper type annotation for params
export async function generateMetadata({ params }: TagPageParams): Promise<Metadata> {
    const { tag } = await params; // Await the promise to get the tag
    const decodedTag: string = decodeURIComponent(tag);
    return {
        title: `Posts tagged with #${decodedTag}`,
    };
}