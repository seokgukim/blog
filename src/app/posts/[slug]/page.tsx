import { getPostData, getAllPostSlugs, PostData } from 'lib/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Generate static paths with proper typing
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
    const paths = getAllPostSlugs();
    return paths.map(p => ({ slug: p.slug }));
}

// Fix the type for the page component params
type PageParams = {
    params: { slug: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}

// Use the properly typed params
export default async function PostPage({ params }: PageParams) {
  try {
    const postData = await getPostData(params.slug);

    return (
      <article className="prose dark:prose-invert max-w-none"> 
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
                className="text-xs px-2 py-0.5 rounded-full no-underline active:scale-95 transition-transform duration-100 ease-in-out"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    );
  } catch (error) {
    console.error(`Error rendering post: ${error instanceof Error ? error.message : String(error)}`);
    notFound();
  }
}

// Use the same type for metadata function 
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  try {
    const postData: PostData = await getPostData(params.slug);
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