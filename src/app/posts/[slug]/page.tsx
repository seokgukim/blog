import { getPostDataS3, getAllPostSlugsS3, PostData } from 'lib/posts_s3';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PostSideNavigator from '@/components/PostSideNavigator'; // Import the navigator

// Generate static paths with proper typing
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
    const paths = await getAllPostSlugsS3();
    return paths.map(p => ({ slug: p.slug }));
}

export const dynamicParams = false;

// Fix the type for the page component params
interface PageParams {
    params: Promise<{
        slug: string;
    }>;
}

export default async function PostPage({ params }: PageParams) {
    const { slug } = await params;
    let postData: PostData;

    try {
        postData = await getPostDataS3(slug);
    } catch (error) {
        console.error(`Error rendering post: ${error instanceof Error ? error.message : String(error)}`);
        notFound();
    }

    return (
        <div className="flex flex-row relative">
            <article id="main-post-content" className="prose dark:prose-invert max-w-none w-full">
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

                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </article>
            <PostSideNavigator contentSelector="#main-post-content" />
        </div>
    );
}

// Use the same type for metadata function 
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { slug } = await params; // Await the promise to get the slug
    try {
        const postData: PostData = await getPostDataS3(slug);
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
