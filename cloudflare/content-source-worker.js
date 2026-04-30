const DEFAULT_BLOG_PREFIX = 'blog';
const POSTS_PREFIX = 'posts/';
const POSTS_MANIFEST_PATH = `${POSTS_PREFIX}index.json`;
const SHORT_CACHE_CONTROL = 'public, max-age=60';
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

function normalizePrefix(prefix) {
  return (prefix || DEFAULT_BLOG_PREFIX).replace(/^\/+|\/+$/g, '');
}

function decodePath(pathname) {
  try {
    return decodeURIComponent(pathname.replace(/^\/+/, ''));
  } catch {
    return undefined;
  }
}

function isSafeRelativePath(path) {
  return path
    .split('/')
    .every((segment) => segment && segment !== '.' && segment !== '..');
}

function getContentType(path) {
  if (path.endsWith('.md')) {
    return 'text/markdown; charset=utf-8';
  }
  if (path.endsWith('.json')) {
    return 'application/json; charset=utf-8';
  }
  if (path.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  if (path.endsWith('.png')) {
    return 'image/png';
  }
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (path.endsWith('.webp')) {
    return 'image/webp';
  }
  return 'application/octet-stream';
}

function json(data, init = {}, includeBody = true) {
  return new Response(includeBody ? JSON.stringify(data) : null, {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': SHORT_CACHE_CONTROL,
      ...CORS_HEADERS,
      ...init.headers,
    },
  });
}

async function listPostManifest(bucket, blogPrefix) {
  const objectPrefix = `${blogPrefix}/${POSTS_PREFIX}`;
  const posts = [];
  let cursor;

  do {
    const listed = await bucket.list({ prefix: objectPrefix, cursor });

    for (const object of listed.objects) {
      const fileName = object.key.slice(objectPrefix.length);

      if (fileName && fileName.endsWith('.md') && !fileName.includes('/')) {
        posts.push(fileName);
      }
    }

    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  return posts.sort((a, b) => a.localeCompare(b));
}

function methodNotAllowed() {
  return new Response('Method not allowed', {
    status: 405,
    headers: {
      allow: 'GET, HEAD, OPTIONS',
      ...CORS_HEADERS,
    },
  });
}

async function serveObject(bucket, key, includeBody = true) {
  const object = includeBody ? await bucket.get(key) : await bucket.head(key);

  if (!object) {
    return new Response('Not found', {
      status: 404,
      headers: CORS_HEADERS,
    });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  if (!headers.has('content-type')) {
    headers.set('content-type', getContentType(key));
  }
  if (!headers.has('cache-control')) {
    headers.set('cache-control', SHORT_CACHE_CONTROL);
  }
  for (const [name, value] of Object.entries(CORS_HEADERS)) {
    headers.set(name, value);
  }

  return new Response(includeBody && object.body ? object.body : null, { headers });
}

const worker = {
  async fetch(request, env) {
    const blogPrefix = normalizePrefix(env.BLOG_PREFIX);
    const url = new URL(request.url);
    const path = decodePath(url.pathname);
    const pathPrefix = `${blogPrefix}/`;
    const includeBody = request.method !== 'HEAD';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return methodNotAllowed();
    }

    if (path === undefined) {
      return new Response('Bad request', {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    if (!env.BLOG_BUCKET) {
      return new Response('BLOG_BUCKET binding is required.', {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    if (!path.startsWith(pathPrefix)) {
      return new Response('Not found', {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    const relativePath = path.slice(pathPrefix.length);

    if (!isSafeRelativePath(relativePath)) {
      return new Response('Bad request', {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    if (relativePath === POSTS_MANIFEST_PATH) {
      return json(await listPostManifest(env.BLOG_BUCKET, blogPrefix), {}, includeBody);
    }

    return serveObject(env.BLOG_BUCKET, `${blogPrefix}/${relativePath}`, includeBody);
  },
};

export default worker;
