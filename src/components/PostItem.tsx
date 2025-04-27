import Link from 'next/link';
import Card, { CardContent } from '@/components/Card'; // Import Card

interface PostItemProps {
  slug: string;
  date: string;
  title: string;
  tags?: string[];
}

export default function PostItem({ slug, date, title, tags }: PostItemProps) {
  const postUrl = `/posts/${slug}`; // Removed locale segment

  return (
    <Card className="mb-4"> {/* Wrap with Card */}
      <CardContent> {/* Use CardContent for padding */}
        {/* Added animation classes */}
        <Link href={postUrl} className="hover:text-primary block active:scale-[0.98] transition-transform duration-100 ease-in-out">
          <h2 className="text-2xl font-semibold mb-1">{title}</h2>
        </Link>
        <time dateTime={date} className="text-sm text-muted-light dark:text-muted-dark mb-2 block">
          {new Date(date).toLocaleDateString('ko-KR', { // Format date using Korean locale
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              // Replace span with Link
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`} // Removed locale segment
                // Apply styling and animation
                className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light px-2 py-0.5 rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 no-underline active:scale-95 transition-transform duration-100 ease-in-out"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}