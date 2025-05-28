// Get markdown // Get markdown posts from MinIO storage
import * as Minio from 'minio';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import { VFile } from 'vfile';
import type { Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';

// --- MinIO Client Setup ---
// Ensure these environment variables are set
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT!;
const MINIO_PORT = parseInt(process.env.MINIO_PORT || "9000", 10);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY!;
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY!;
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;
const POSTS_PREFIX_RAW = process.env.MINIO_POSTS_PREFIX || 'posts/'; // Default to 'posts/'

const minioClient = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
});

// Normalize prefix to ensure it ends with a slash if not empty
const postsPrefix = POSTS_PREFIX_RAW && POSTS_PREFIX_RAW.length > 0
    ? (POSTS_PREFIX_RAW.endsWith('/') ? POSTS_PREFIX_RAW : `${POSTS_PREFIX_RAW}/`)
    : '';

// --- Define interfaces for post data (same as posts.ts) ---
export interface PostFrontmatter {
    title: string;
    date: string;
    tags?: string[];
}

export interface PostData extends PostFrontmatter {
    slug: string;
    contentHtml: string;
}

export type PostListItem = Omit<PostData, 'contentHtml'>;

// --- Configure markdown processor (same as posts.ts) ---
const markdownProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm) // GitHub Flavored Markdown support
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrettyCode, {
        theme: 'github-dark',
        keepBackground: false,
    } as RehypePrettyCodeOptions)
    .use(rehypeStringify, { allowDangerousHtml: true });

// --- Helper function to parse frontmatter safely (same as posts.ts) ---
function parseFrontmatter(data: Record<string, unknown>, filePath: string): PostFrontmatter {
    const { title, date, tags } = data;

    if (typeof title !== 'string' || !title) {
        throw new Error(`Post "${filePath}" missing required 'title' field.`);
    }
    if (tags !== undefined && (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string'))) {
        throw new Error(`Post "${filePath}" 'tags' field must be an array of strings if present.`);
    }

    let parsedDate: string;
    // Date regex like yyyy-mm-dd
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof date === 'string' && dateRegex.test(date)) {
        parsedDate = date;
    } else if (date instanceof Date && !isNaN(date.getTime())) {
        parsedDate = date.toISOString().split('T')[0]; // Convert Date to yyyy-mm-dd
    } else {
        throw new Error(`Post "${filePath}" missing or invalid 'date' field. Expected format: yyyy-mm-dd.`);
    }
    
    return {
        title,
        date: parsedDate,
        tags: tags as string[] | undefined,
    };
}

// --- Helper function to convert stream to string ---
async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

// --- Helper function to get all post keys from MinIO ---
interface MinioPostKey {
    slug: string;
    objectName: string; // Full path in MinIO, e.g., "posts/my-post.md"
    fileName: string;   // File name relative to prefix, e.g., "my-post.md"
}

async function getAllPostKeysFromMinio(): Promise<MinioPostKey[]> {
    const keys: MinioPostKey[] = [];
    try {
        const objectsStream = minioClient.listObjectsV2(BUCKET_NAME, postsPrefix, true); // true for recursive

        for await (const obj of objectsStream) {
            if (obj.name && obj.name.endsWith('.md') && obj.name.length > postsPrefix.length) {
                const fileName = obj.name.substring(postsPrefix.length);
                keys.push({
                    slug: fileName.replace(/\.md$/, ''),
                    objectName: obj.name,
                    fileName: fileName,
                });
            }
        }
        return keys;
    } catch (error) {
        console.error("Error listing objects from MinIO:", error);
        throw error; // Re-throw to be caught by calling functions
    }
}


// --- Get all posts data for listing from MinIO ---
export async function getSortedPostsDataMinio(): Promise<PostListItem[]> {
    try {
        const postKeys = await getAllPostKeysFromMinio();
        if (!postKeys || postKeys.length === 0) {
            console.warn(`No markdown posts found in MinIO bucket "${BUCKET_NAME}" with prefix "${postsPrefix}"`);
            return [];
        }

        const allPostsDataPromises = postKeys.map(async (key): Promise<PostListItem | null> => {
            try {
                const objectStream = await minioClient.getObject(BUCKET_NAME, key.objectName);
                const fileContents = await streamToString(objectStream);
                const matterResult = matter(fileContents);
                const frontmatter = parseFrontmatter(matterResult.data, key.fileName);

                return {
                    slug: key.slug,
                    ...frontmatter,
                };
            } catch (error: unknown) {
                console.error(`Error processing frontmatter for MinIO object ${key.objectName}:`,
                    error instanceof Error ? error.message : String(error));
                return null;
            }
        });

        const allPostsData = (await Promise.all(allPostsDataPromises))
            .filter((post): post is PostListItem => post !== null);

        return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
    } catch (error: unknown) {
        console.error("Error getting sorted posts data from MinIO:",
            error instanceof Error ? error.message : String(error));
        return [];
    }
}

// --- Get all post slugs for static generation from MinIO ---
export async function getAllPostSlugsMinio(): Promise<{ slug: string }[]> {
    try {
        const postKeys = await getAllPostKeysFromMinio();
        return postKeys.map(key => ({ slug: key.slug }));
    } catch (error: unknown) {
        console.error("Error reading post slugs from MinIO:",
            error instanceof Error ? error.message : String(error));
        return [];
    }
}

// --- Get all unique tags from posts in MinIO ---
export async function getAllTagsMinio(): Promise<string[]> {
    const posts = await getSortedPostsDataMinio();
    const tags = new Set<string>();
    posts.forEach(post => {
        post.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
}

// --- Get posts filtered by tag from MinIO ---
export async function getPostsByTagMinio(tag: string): Promise<PostListItem[]> {
    const posts = await getSortedPostsDataMinio();
    return posts.filter(post => post.tags?.includes(tag) ?? false);
}

// --- Get full post data including HTML content from MinIO ---
export async function getPostDataMinio(slug: string): Promise<PostData> {
    const objectName = `${postsPrefix}${slug}.md`;
    const fileNameForErrorContext = `${slug}.md`;

    try {
        const objectStream = await minioClient.getObject(BUCKET_NAME, objectName);
        const fileContents = await streamToString(objectStream);

        const matterResult = matter(fileContents);
        const frontmatter = parseFrontmatter(matterResult.data, fileNameForErrorContext);

        let processedContent: VFile;
        try {
            processedContent = await markdownProcessor.process(matterResult.content);
        } catch (error: unknown) {
            console.error(`Error processing markdown content for MinIO object ${objectName} (slug: ${slug}):`,
                error instanceof Error ? error.message : String(error));
            throw new Error(`Failed to process markdown for ${slug}`);
        }
        const contentHtml = processedContent.toString();

        return {
            slug,
            contentHtml,
            ...frontmatter,
        };
    } catch (error: unknown) {
        console.error(`Error getting post data for MinIO object ${objectName} (slug: ${slug}):`,
            error instanceof Error ? error.message : String(error));
        throw new Error(`Could not read or process post file from MinIO: ${fileNameForErrorContext}`);
    }
}