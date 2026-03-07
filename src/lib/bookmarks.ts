import type { BookmarkFolder, BookmarkSite } from './types';

/**
 * Returns the Chrome _favicon URL for a page.
 * Uses the official MV3 favicon API (chrome.runtime.getURL + URL constructor).
 * Requires "favicon" permission in manifest.json.
 *
 * IMPORTANT: If permissions change, the extension must be removed
 * and re-loaded in chrome://extensions (refresh alone is not enough).
 */
export function getFaviconUrl(pageUrl: string): string {
  try {
    const url = new URL(chrome.runtime.getURL('/_favicon/'));
    url.searchParams.set('pageUrl', pageUrl);
    url.searchParams.set('size', '32');
    return url.toString();
  } catch {
    return '';
  }
}

/**
 * Returns top-level bookmark folders (direct children of Bookmarks Bar
 * and Other Bookmarks) that contain at least one bookmark.
 */
export async function getBookmarkFolders(): Promise<BookmarkFolder[]> {
  const tree = await chrome.bookmarks.getTree();
  const folders: BookmarkFolder[] = [];

  // tree[0].children are the root containers (Bookmarks Bar, Other Bookmarks, Mobile Bookmarks)
  const roots = tree[0]?.children ?? [];
  for (const root of roots) {
    if (!root.children) continue;
    for (const child of root.children) {
      if (child.children) {
        const bookmarkCount = child.children.filter((c) => !!c.url).length;
        if (bookmarkCount > 0) {
          folders.push({
            id: child.id,
            title: child.title || 'Untitled',
            bookmarkCount,
          });
        }
      }
    }
    // Also collect bookmarks directly in the root as a virtual folder
    const rootBookmarks = root.children.filter((c) => !!c.url);
    if (rootBookmarks.length > 0) {
      folders.push({
        id: root.id,
        title: root.title || 'Bookmarks',
        bookmarkCount: rootBookmarks.length,
      });
    }
  }

  return folders;
}

/**
 * Returns all bookmarks (URLs) directly inside a given folder.
 */
export async function getFolderBookmarks(folderId: string): Promise<BookmarkSite[]> {
  const children = await chrome.bookmarks.getChildren(folderId);
  return children
    .filter((c) => !!c.url)
    .map((c) => ({
      id: c.id,
      url: c.url!,
      title: c.title || extractHostname(c.url!),
    }));
}

/**
 * Searches all bookmarks across all folders using Chrome's built-in search API.
 */
export async function searchAllBookmarks(query: string): Promise<BookmarkSite[]> {
  if (!query.trim()) return [];
  const results = await chrome.bookmarks.search(query);
  return results
    .filter((c) => !!c.url)
    .map((c) => ({
      id: c.id,
      url: c.url!,
      title: c.title || extractHostname(c.url!),
    }));
}

export function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
