import { getSortedPostsDataMinio, PostListItem } from 'lib/posts_minio';
import PostItem from '@/components/PostItem';
import Link from 'next/link'; // Import Link for navigation
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa'; // Import icons

export default async function Home() {
    const allPostsData: PostListItem[] = await getSortedPostsDataMinio();
    const recentPost = allPostsData.length > 0 ? allPostsData[0] : null; // Get the first post (most recent)

    // Hardcoded Korean strings based on ko.json
    const title = "SeokguKim's Garage"; // From ko.json HomePage.title
    const subtitle = "김석구의 잡동사니 창고"; // From ko.json HomePage.subtitle
    const recentPostHeading = "최근 포스트"; // Example heading
    const noPostsFoundText = "아직 포스트가 없습니다."; // From ko.json PostsPage.noPostsFound

    // Replace with your actual profile URLs
    const formerBlogUrl = "https://seokgukim.github.io";
    const githubUrl = "https://github.com/seokgukim";
    const linkedinUrl = "https://linkedin.com/in/seungroklee549";

    return (
        <section>
            {/* Title and Subtitle */}
            <h1 className="text-4xl font-bold mb-2 text-foreground-light dark:text-foreground-dark">{title}</h1>
            <p className="text-xl text-muted-light dark:text-muted-dark mb-8">{subtitle}</p>

            {/* Social Links */}
            <div className="flex space-x-4 mb-12">
                <a
                    href={formerBlogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Former Blog"
                    // Added hover:scale-110, active:scale-95, transition-transform, duration-150
                    className="text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-all duration-150 ease-in-out hover:scale-110 active:scale-95"
                >
                    <FaGlobe size={28} /> {/* Adjust icon size as needed */}
                </a>

                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Profile"
                    // Added hover:scale-110, active:scale-95, transition-transform, duration-150
                    className="text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-all duration-150 ease-in-out hover:scale-110 active:scale-95"
                >
                    <FaGithub size={28} /> {/* Adjust icon size as needed */}
                </a>
                <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    // Added hover:scale-110, active:scale-95, transition-transform, duration-150
                    className="text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-all duration-150 ease-in-out hover:scale-110 active:scale-95"
                >
                    <FaLinkedin size={28} /> {/* Adjust icon size as needed */}
                </a>
                {/* Add other social links here */}
            </div>

            {/* Recent Post Section */}
            <h2 className="text-2xl font-semibold mb-4 text-foreground-light dark:text-foreground-dark">{recentPostHeading}</h2>
            {recentPost ? (
                // You might want to add hover/active animations inside the PostItem component itself
                // for a better effect on the card/link within it.
                <PostItem
                    key={recentPost.slug}
                    slug={recentPost.slug}
                    date={recentPost.date}
                    title={recentPost.title}
                    tags={recentPost.tags}
                />
            ) : (
                <p className="text-muted-light dark:text-muted-dark">{noPostsFoundText}</p>
            )}

            {/* Optional: Link to see all posts */}
            {allPostsData.length > 1 && (
                <div className="mt-8">
                    {/* Added hover:opacity-80, active:scale-95, transition, duration-150 */}
                    <Link href="/posts" className="text-primary hover:underline hover:opacity-80 active:scale-95 inline-block transition duration-150 ease-in-out">
                        모든 포스트 보기
                    </Link>
                </div>
            )}
        </section>
    );
}