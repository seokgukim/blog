import matter from 'gray-matter';
import { XMLParser } from 'fast-xml-parser';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { VFile } from 'vfile';
import type { Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import {
    getAllPostSlugs as getLocalAllPostSlugs,
    getAllTags as getLocalAllTags,
    getPostData as getLocalPostData,
    getPostsByTag as getLocalPostsByTag,
    getSortedPostsData as getLocalSortedPostsData,
} from './posts';

const DEFAULT_S3_BLOG_PATH = '/blog';
const DEFAULT_S3_POST_DISCOVERY = 'manifest';
const POSTS_PREFIX = 'posts/';
const POSTS_MANIFEST_PATH = `${POSTS_PREFIX}index.json`;

type S3PostDiscoveryMode = 'manifest' | 'list' | 'auto';

const s3PublicEndpoint = process.env.S3_PUBLIC_ENDPOINT === undefined
    ? undefined
    : normalizeEndpoint(process.env.S3_PUBLIC_ENDPOINT);
const s3BlogPath = normalizePath(
    process.env.S3_BLOG_PATH ?? DEFAULT_S3_BLOG_PATH,
);
const s3PostDiscoveryMode = normalizePostDiscoveryMode(
    process.env.S3_POST_DISCOVERY ?? DEFAULT_S3_POST_DISCOVERY,
);

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: true,
});

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

interface S3PostKey {
    slug: string;
    objectName: string;
    fileName: string;
}

type PostManifest = string[] | {
    posts: Array<string | {
        slug?: string;
        fileName?: string;
        path?: string;
    }>;
};

const markdownProcessor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrettyCode, {
        theme: 'github-dark',
        keepBackground: false,
    } as RehypePrettyCodeOptions)
    .use(rehypeStringify, { allowDangerousHtml: true });

let postKeysPromise: Promise<S3PostKey[]> | undefined;
let sortedPostsPromise: Promise<PostListItem[]> | undefined;
const postDataPromises = new Map<string, Promise<PostData>>();

function normalizeEndpoint(endpoint: string): string {
    const trimmedEndpoint = endpoint.trim();

    if (!trimmedEndpoint) {
        throw new Error('S3_PUBLIC_ENDPOINT must not be empty.');
    }

    return trimmedEndpoint.replace(/\/+$/, '');
}

function normalizePath(pathValue: string): string {
    const trimmedPath = pathValue.trim();

    if (!trimmedPath || trimmedPath === '/') {
        return '';
    }

    return `/${trimmedPath.replace(/^\/+|\/+$/g, '')}`;
}

function normalizePostDiscoveryMode(mode: string): S3PostDiscoveryMode {
    const normalizedMode = mode.trim().toLowerCase();

    if (normalizedMode === 'manifest' || normalizedMode === 'list' || normalizedMode === 'auto') {
        return normalizedMode;
    }

    throw new Error('S3_POST_DISCOVERY must be one of: manifest, list, auto.');
}

function getBlogUrl(pathValue = ''): string {
    if (!s3PublicEndpoint) {
        throw new Error('S3_PUBLIC_ENDPOINT is required when using the S3/R2 post source.');
    }

    const normalizedObjectPath = pathValue
        .split('/')
        .filter(Boolean)
        .map(encodeURIComponent)
        .join('/');

    return `${s3PublicEndpoint}${s3BlogPath}${normalizedObjectPath ? `/${normalizedObjectPath}` : ''}`;
}

function getListUrl(continuationToken?: string): string {
    const listUrl = new URL(getBlogUrl());
    listUrl.searchParams.set('list-type', '2');
    listUrl.searchParams.set('prefix', POSTS_PREFIX);
    listUrl.searchParams.set('encoding-type', 'url');

    if (continuationToken) {
        listUrl.searchParams.set('continuation-token', continuationToken);
    }

    return listUrl.toString();
}

async function fetchText(url: string, context: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${context} from ${url}: ${response.status} ${response.statusText}`);
    }

    return response.text();
}

function asRecord(value: unknown, context: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Unexpected S3 XML structure while reading ${context}.`);
    }

    return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
    if (value === undefined) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
}

function asString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

function decodeS3Key(key: string): string {
    try {
        return decodeURIComponent(key);
    } catch {
        return key;
    }
}

function toPostKeyFromFileName(fileName: string): S3PostKey {
    if (!fileName.endsWith('.md')) {
        throw new Error(`S3 post manifest entry must point to a markdown file: ${fileName}`);
    }
    if (!isSafePathSegment(fileName)) {
        throw new Error(`S3 post manifest entry must be a markdown file name, not a path: ${fileName}`);
    }

    return {
        slug: fileName.replace(/\.md$/, ''),
        objectName: `${POSTS_PREFIX}${fileName}`,
        fileName,
    };
}

function isSafePathSegment(value: string): boolean {
    return Boolean(value) &&
        !value.includes('/') &&
        !value.includes('\\') &&
        value !== '.' &&
        value !== '..';
}

function parsePostManifest(manifestJson: string): S3PostKey[] {
    const parsedManifest = JSON.parse(manifestJson) as PostManifest;
    const manifestPosts = Array.isArray(parsedManifest) ? parsedManifest : parsedManifest.posts;

    if (!Array.isArray(manifestPosts)) {
        throw new Error(`S3 post manifest must be an array or contain a "posts" array.`);
    }

    return manifestPosts.map((entry): S3PostKey => {
        if (typeof entry === 'string') {
            return toPostKeyFromFileName(entry.replace(/^posts\//, ''));
        }

        const fileName = entry.fileName ?? entry.path?.replace(/^posts\//, '') ?? (entry.slug ? `${entry.slug}.md` : undefined);

        if (!fileName) {
            throw new Error('S3 post manifest object entries must include slug, fileName, or path.');
        }

        return toPostKeyFromFileName(fileName);
    }).sort((a, b) => a.fileName.localeCompare(b.fileName));
}

async function listS3PostKeys(): Promise<S3PostKey[]> {
    const keys: S3PostKey[] = [];
    let continuationToken: string | undefined;

    do {
        const listXml = await fetchText(getListUrl(continuationToken), 'S3 post list');
        const parsedXml = asRecord(xmlParser.parse(listXml), 'S3 post list');
        const resultSource = parsedXml.ListBucketResult;

        if (!resultSource) {
            throw new Error('S3 post list response did not contain a ListBucketResult root.');
        }

        const result = asRecord(resultSource, 'S3 post list');
        const contents = asArray(result.Contents);

        for (const item of contents) {
            const key = asString(asRecord(item, 'S3 object entry').Key);

            if (!key) {
                continue;
            }

            const objectName = decodeS3Key(key);

            if (objectName.endsWith('.md') && objectName.length > POSTS_PREFIX.length) {
                const fileName = objectName.substring(POSTS_PREFIX.length);
                keys.push({
                    slug: fileName.replace(/\.md$/, ''),
                    objectName,
                    fileName,
                });
            }
        }

        const isTruncated = asString(result.IsTruncated) === 'true';
        continuationToken = isTruncated ? asString(result.NextContinuationToken) : undefined;
    } while (continuationToken);

    return keys.sort((a, b) => a.fileName.localeCompare(b.fileName));
}

async function getPostKeysFromManifest(): Promise<S3PostKey[]> {
    const manifestJson = await fetchText(getBlogUrl(POSTS_MANIFEST_PATH), `S3 post manifest ${POSTS_MANIFEST_PATH}`);
    return parsePostManifest(manifestJson);
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

async function resolveS3PostKeys(): Promise<S3PostKey[]> {
    if (s3PostDiscoveryMode === 'manifest') {
        try {
            return await getPostKeysFromManifest();
        } catch (manifestError: unknown) {
            throw new Error(
                `Could not discover S3 posts using S3_POST_DISCOVERY=manifest. ` +
                `Publish ${getBlogUrl(POSTS_MANIFEST_PATH)} or deploy the R2 content Worker that generates it. ` +
                `Manifest error: ${errorMessage(manifestError)}.`,
            );
        }
    }

    if (s3PostDiscoveryMode === 'list') {
        try {
            return await listS3PostKeys();
        } catch (listError: unknown) {
            throw new Error(
                `Could not discover S3 posts using S3_POST_DISCOVERY=list. ` +
                `Enable public ListBucket at ${getListUrl()} or set S3_POST_DISCOVERY=manifest for the R2 content Worker. ` +
                `List error: ${errorMessage(listError)}.`,
            );
        }
    }

    try {
        return await getPostKeysFromManifest();
    } catch (manifestError: unknown) {
        try {
            return await listS3PostKeys();
        } catch (listError: unknown) {
            throw new Error(
                `Could not discover S3 posts using S3_POST_DISCOVERY=auto. ` +
                `Publish ${getBlogUrl(POSTS_MANIFEST_PATH)} or enable public ListBucket at ${getListUrl()}. ` +
                `Manifest error: ${errorMessage(manifestError)}. List error: ${errorMessage(listError)}.`,
            );
        }
    }
}

function getAllPostKeysFromS3(): Promise<S3PostKey[]> {
    postKeysPromise ??= resolveS3PostKeys();
    return postKeysPromise;
}

function parseFrontmatter(data: Record<string, unknown>, filePath: string): PostFrontmatter {
    const { title, date, tags } = data;

    if (typeof title !== 'string' || !title) {
        throw new Error(`Post "${filePath}" missing required 'title' field.`);
    }
    if (tags !== undefined && (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string'))) {
        throw new Error(`Post "${filePath}" 'tags' field must be an array of strings if present.`);
    }

    let parsedDate: string;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof date === 'string' && dateRegex.test(date)) {
        parsedDate = date;
    } else if (date instanceof Date && !Number.isNaN(date.getTime())) {
        parsedDate = date.toISOString().split('T')[0];
    } else {
        throw new Error(`Post "${filePath}" missing or invalid 'date' field. Expected format: yyyy-mm-dd.`);
    }

    return {
        title,
        date: parsedDate,
        tags: tags as string[] | undefined,
    };
}

async function getPostMarkdown(objectName: string): Promise<string> {
    return fetchText(getBlogUrl(objectName), `S3 object ${objectName}`);
}

async function loadPostDataFromS3(slug: string): Promise<PostData> {
    if (!isSafePathSegment(slug)) {
        throw new Error(`Invalid S3 post slug: ${slug}`);
    }

    const objectName = `${POSTS_PREFIX}${slug}.md`;
    const fileContents = await getPostMarkdown(objectName);
    const matterResult = matter(fileContents);
    const frontmatter = parseFrontmatter(matterResult.data, `${slug}.md`);

    let processedContent: VFile;
    try {
        processedContent = await markdownProcessor.process(matterResult.content);
    } catch (error: unknown) {
        console.error(`Error processing markdown content for S3 object ${objectName}:`,
            error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to process markdown for ${slug}`);
    }

    return {
        slug,
        contentHtml: processedContent.toString(),
        ...frontmatter,
    };
}

export async function getSortedPostsDataS3(): Promise<PostListItem[]> {
    if (!s3PublicEndpoint) {
        return getLocalSortedPostsData();
    }

    sortedPostsPromise ??= (async () => {
        const postKeys = await getAllPostKeysFromS3();
        const allPostsData = await Promise.all(
            postKeys.map(async (key): Promise<PostListItem> => {
                const fileContents = await getPostMarkdown(key.objectName);
                const matterResult = matter(fileContents);
                const frontmatter = parseFrontmatter(matterResult.data, key.fileName);

                return {
                    slug: key.slug,
                    ...frontmatter,
                };
            }),
        );

        return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
    })();

    return sortedPostsPromise;
}

export async function getAllPostSlugsS3(): Promise<{ slug: string }[]> {
    if (!s3PublicEndpoint) {
        return getLocalAllPostSlugs();
    }

    const postKeys = await getAllPostKeysFromS3();
    return postKeys.map(key => ({ slug: key.slug }));
}

export async function getAllTagsS3(): Promise<string[]> {
    if (!s3PublicEndpoint) {
        return getLocalAllTags();
    }

    const posts = await getSortedPostsDataS3();
    const tags = new Set<string>();

    posts.forEach(post => {
        post.tags?.forEach(tag => tags.add(tag));
    });

    return Array.from(tags);
}

export async function getPostsByTagS3(tag: string): Promise<PostListItem[]> {
    if (!s3PublicEndpoint) {
        return getLocalPostsByTag(tag);
    }

    const posts = await getSortedPostsDataS3();
    return posts.filter(post => post.tags?.includes(tag) ?? false);
}

export async function getPostDataS3(slug: string): Promise<PostData> {
    if (!s3PublicEndpoint) {
        return getLocalPostData(slug);
    }

    const cachedPostData = postDataPromises.get(slug);
    if (cachedPostData) {
        return cachedPostData;
    }

    const postDataPromise = loadPostDataFromS3(slug);
    postDataPromises.set(slug, postDataPromise);
    return postDataPromise;
}
