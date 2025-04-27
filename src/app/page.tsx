import { getSortedPostsData, PostListItem } from 'lib/posts';
import PostItem from '@/components/PostItem';

export default function Home() {
  const allPostsData: PostListItem[] = getSortedPostsData();

  // Hardcoded Korean strings based on ko.json
  const title = "SeokguKim's Garage"; // From ko.json HomePage.title
  const subtitle = "김석구의 잡동사니 창고"; // From ko.json HomePage.subtitle
  const noPostsFoundText = "아직 포스트가 없습니다."; // From ko.json PostsPage.noPostsFound (assuming similar text needed)

  return (
    <section>
      {/* Use defined foreground/muted colors from Tailwind theme */}
      <h1 className="text-4xl font-bold mb-2 text-foreground-light dark:text-foreground-dark">{title}</h1>
      <p className="text-xl text-muted-light dark:text-muted-dark mb-8">{subtitle}</p>

      {/* Use flex column for post items */}
      <div className="flex flex-col space-y-0"> {/* Remove space-y if Card adds margin */}
        {allPostsData.map((post: PostListItem) => (
          <PostItem
            key={post.slug}
            slug={post.slug}
            date={post.date}
            title={post.title}
            tags={post.tags}
          />
        ))}
        {allPostsData.length === 0 && (
            <p className="text-muted-light dark:text-muted-dark">{noPostsFoundText}</p> // Hardcoded text
        )}
      </div>
    </section>
  );
}