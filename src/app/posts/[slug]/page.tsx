import { getPostDataMinio, getAllPostSlugsMinio, PostData } from 'lib/posts_minio';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PostSideNavigator from '@/components/PostSideNavigator'; // Import the navigator

// Generate static paths with proper typing
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
    const paths = await getAllPostSlugsMinio();
    return paths.map(p => ({ slug: p.slug }));
}

// Fix the type for the page component params
interface PageParams {
    params: Promise<{
        slug: string;
    }>;
}

// Use the properly typed params
export default function PostPage({ params }: PageParams) {

    const renderPost = async () => {
        try {
            const { slug } = await params; // Await the promise to get the slug
            const postData = await getPostDataMinio(slug);

            return (
                // Added relative positioning for potential absolute children and flex container
                <div className="flex flex-row relative">
                    {/* Main content area - assign the ref here */}
                    {/* Added margin-left for lg screens to avoid overlap with fixed navigator */}
                    <article id="main-post-content" className="prose dark:prose-invert max-w-none lg:ml-52 w-full">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">{postData.title}</h1>
                        <div className="text-sm mb-4">
                            <time dateTime={postData.date}>
                                {new Date(postData.date).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </time>
                        </div>

                        {postData.tags && postData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6 not-prose">
                                {postData.tags.map((tag: string) => (
                                    <Link
                                        key={tag}
                                        href={`/tags/${encodeURIComponent(tag)}`}
                                        className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light px-2 py-0.5 rounded-full no-underline hover:bg-primary/20 dark:hover:bg-primary/30 hover:scale-105 active:scale-95 transition-all duration-150 ease-in-out"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Ensure the content container has the actual headings */}
                        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
                    </article>
                    {/* Render the side navigator, passing the ref */}
                    {/* It will be positioned fixed by its own styles */}
                    <PostSideNavigator contentSelector="#main-post-content" />
                </div>
            );
        } catch (error) {
            console.error(`Error rendering post: ${error instanceof Error ? error.message : String(error)}`);
            notFound(); // Trigger notFound directly
            // Return null or an error message component if notFound doesn't stop execution
            return null;
        }
    };

    // Since PostPage is an async component, we directly return the result of renderPost
    return renderPost();
}

// Use the same type for metadata function 
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { slug } = await params; // Await the promise to get the slug
    try {
        const postData: PostData = await getPostDataMinio(slug);
        return {
            title: postData.title,
        };
    } catch (error: unknown) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Post not found',
        };
    }
}