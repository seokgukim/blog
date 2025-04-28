import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified, Processor } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { VFile } from 'vfile';
import type { Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';

// Define interfaces for post data
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

// Configure markdown processor
const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
  .use(rehypePrettyCode, {
    theme: 'github-dark',
    keepBackground: false,
  } as RehypePrettyCodeOptions)
  .use(rehypeStringify, { allowDangerousHtml: true });

// Helper function to parse frontmatter safely
function parseFrontmatter(data: Record<string, unknown>, filePath: string): PostFrontmatter {
  const { title, date, tags } = data;

  if (typeof title !== 'string' || !title) {
    throw new Error(`Post "${filePath}" missing required 'title' field.`);
  }
  if (typeof date !== 'string' || !date) {
    throw new Error(`Post "${filePath}" missing required 'date' field.`);
  }
  if (tags !== undefined && (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string'))) {
    throw new Error(`Post "${filePath}" 'tags' field must be an array of strings if present.`);
  }

  return {
    title,
    date,
    tags: tags as string[] | undefined,
  };
}

// Get all posts data for listing
export function getSortedPostsData() {
  // Ensure postsDirectory is correct
  const postsDirectory = path.join(process.cwd(), 'content/posts');

  try {
    if (!fs.existsSync(postsDirectory)) {
      console.warn(`Posts directory not found: ${postsDirectory}`);
      return [];
    }

    const fileNames: string[] = fs.readdirSync(postsDirectory);
    const allPostsData: PostListItem[] = fileNames
      .filter((fileName: string): boolean => fileName.endsWith('.md'))
      .map((fileName: string): PostListItem | null => {
        const slug: string = fileName.replace(/\.md$/, '');
        const fullPath: string = path.join(postsDirectory, fileName);
        try {
          const fileContents: string = fs.readFileSync(fullPath, 'utf8');
          const matterResult = matter(fileContents);
          const frontmatter: PostFrontmatter = parseFrontmatter(matterResult.data, fileName);
          
          return {
            slug,
            ...frontmatter,
          };
        } catch (error: unknown) {
          console.error(`Error processing frontmatter for ${fileName}:`, 
            error instanceof Error ? error.message : String(error));
          return null;
        }
      })
      .filter((post): post is PostListItem => post !== null);

    return allPostsData.sort((a: PostListItem, b: PostListItem): number => 
      a.date < b.date ? 1 : -1);
  } catch (error: unknown) {
    console.error("Error reading posts directory:", 
      error instanceof Error ? error.message : String(error));
    return [];
  }
}

// Get all post slugs for static generation
export function getAllPostSlugs() {
  // Ensure postsDirectory is correct
  const postsDirectory = path.join(process.cwd(), 'content/posts');

  try {
    if (!fs.existsSync(postsDirectory)) {
      console.warn(`Posts directory not found: ${postsDirectory}`);
      return [];
    }
    
    const fileNames: string[] = fs.readdirSync(postsDirectory);
    return fileNames
      .filter((fileName: string): boolean => fileName.endsWith('.md'))
      .map((fileName: string): { slug: string } => ({
        slug: fileName.replace(/\.md$/, ''),
      }));
  } catch (error: unknown) {
    console.error("Error reading posts directory for slugs:", 
      error instanceof Error ? error.message : String(error));
    return [];
  }
}

// Get all unique tags from posts
export function getAllTags(): string[] {
  const posts: PostListItem[] = getSortedPostsData();
  const tags: Set<string> = new Set<string>();
  
  posts.forEach((post: PostListItem): void => {
    post.tags?.forEach((tag: string): Set<string> => tags.add(tag));
  });
  
  return Array.from(tags);
}

// Get posts filtered by tag
export function getPostsByTag(tag: string): PostListItem[] {
  const posts: PostListItem[] = getSortedPostsData();
  return posts.filter((post: PostListItem): boolean => 
    post.tags?.includes(tag) ?? false);
}

// Get full post data including HTML content
export async function getPostData(slug: string): Promise<PostData> {
  // Ensure postsDirectory is correct
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post file not found: ${fullPath}`);
  }
  
  let fileContents: string;
  try {
    fileContents = fs.readFileSync(fullPath, 'utf8');
  } catch (error: unknown) {
    console.error(`Error reading file ${fullPath}:`, 
      error instanceof Error ? error.message : String(error));
    throw new Error(`Could not read post file: ${slug}.md`);
  }
  
  const matterResult = matter(fileContents);
  const frontmatter: PostFrontmatter = parseFrontmatter(matterResult.data, `${slug}.md`);
  
  let processedContent: VFile;
  try {
    processedContent = await markdownProcessor.process(matterResult.content);
  } catch (error: unknown) {
    console.error(`Error processing markdown content for ${slug}:`, 
      error instanceof Error ? error.message : String(error));
    throw new Error(`Failed to process markdown for ${slug}`);
  }
  
  const contentHtml: string = processedContent.toString();
  
  return {
    slug,
    contentHtml,
    ...frontmatter,
  };
}