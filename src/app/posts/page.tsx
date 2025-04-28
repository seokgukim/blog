import { getSortedPostsData, PostListItem } from 'lib/posts';
import PostItem from '@/components/PostItem'; // Assuming PostItem is in components

interface PostsPageProps {
  params: { locale: string };
}

export default function PostsPage({ params: { locale } }: PostsPageProps) {
  const title = "Posts";
  const subtitle = "모든 포스트를 한 곳에서 확인하세요.";
  const noPostsFound = "아직 포스트가 없습니다."; // From ko.json PostsPage.noPostsFound
  const allPostsData: PostListItem[] = getSortedPostsData();

  return (
    <section>
      <h1 className="text-3xl font-bold mb-4 text-foreground-light dark:text-foreground-dark">
        {title}
      </h1>
      <p className="text-lg text-muted-light dark:text-muted-dark mb-8">
        {subtitle}
      </p>

      {allPostsData.length > 0 ? (
        <div className="flex flex-col space-y-0"> {/* Adjust spacing as needed */}
          {allPostsData.map((post) => (
            <PostItem
              key={post.slug}
              slug={post.slug}
              date={post.date}
              title={post.title}
              tags={post.tags}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-light dark:text-muted-dark">{noPostsFound}</p>
      )}
    </section>
  );
}

// Optional: Add metadata generation
// import type { Metadata } from 'next';
// import { getTranslator } from 'next-intl/server';

// export async function generateMetadata({ params: { locale } }: PostsPageProps): Promise<Metadata> {
//   const t = await getTranslator(locale, 'PostsPage');
//   return {
//     title: t('metaTitle'),
//   };
// }