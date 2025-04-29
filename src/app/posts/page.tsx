import { getSortedPostsData, PostListItem } from 'lib/posts';
import PostItem from '@/components/PostItem'; // Assuming PostItem is in components


export default function PostsPage() {
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
        </div>
      ) : (
        <p className="text-muted-light dark:text-muted-dark">{noPostsFound}</p>
      )}
    </section>
  );
}