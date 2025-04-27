import { getPostData, getAllPostSlugs, PostData } from 'lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

// Generate static paths
export async function generateStaticParams(): Promise<{ slug: string }[]> {
    const paths = getAllPostSlugs();
    // Assuming middleware handles locale segment, just return slugs
    return paths.map(p => ({ slug: p.slug }));
}

// Define props type for clarity (removed locale)
interface PostPageProps {
    params: {
        slug: string;
    };
}


export default async function PostPage({ params }: PostPageProps) {
  let postData: PostData;
  const awaitedParams = await params;
  try {
    postData = await getPostData(awaitedParams.slug);
  } catch (error: unknown) {
    console.error(`Error fetching post data for slug "${awaitedParams.slug}":`, error instanceof Error ? error.message : error);
    notFound();
  }

  return (
  // Add a base theme like prose-slate
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
            href={`/tags/${encodeURIComponent(tag)}`} // Removed locale segment
            className="text-xs  px-2 py-0.5 rounded-full no-underline active:scale-95 transition-transform duration-100 ease-in-out"
          >
            #{tag}
          </Link>
        ))}
      </div>
    )}

    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
  </article>
  );
}

// Define metadata props type
interface MetadataProps {
    params: { slug: string };
}

// Generate metadata for the page
export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  try {
    // wait for params.slug to be resolved
    const awaitedParams = await params;
    const postData: PostData = await getPostData(awaitedParams.slug);
    return {
      title: postData.title,
      // description: postData.excerpt, // Add excerpt if available
    };
  } catch (error: unknown) {
    // Return metadata for not found state
    return {
      title: 'Post not found',
    };
  }
}