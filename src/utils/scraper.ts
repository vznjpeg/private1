import type { RedditComment, RedditThread } from '../types/reddit';
import {
  SELECTORS,
  querySelector,
  querySelectorAll,
  extractText,
  extractScore,
  extractTimestamp,
  isCommentDeleted,
  isCommentEdited,
} from './dom-selectors';

const SCRAPE_TIMEOUT = 60000; // 60 seconds
let isScraping = false;

/**
 * Main scraping function - called from content script
 */
export function scrapeRedditThread(): Promise<RedditThread> {
  return new Promise((resolve, reject) => {
    if (isScraping) {
      reject(new Error('Scraping already in progress'));
      return;
    }

    isScraping = true;
    const timeoutId = setTimeout(() => {
      isScraping = false;
      reject(new Error('Scraping timeout - thread too large or page not ready'));
    }, SCRAPE_TIMEOUT);

    try {
      const thread = _scrapeThreadData();
      if (!thread) {
        throw new Error(
          'Could not find thread data. Make sure you are on a Reddit thread page.',
        );
      }

      clearTimeout(timeoutId);
      isScraping = false;
      resolve(thread);
    } catch (error) {
      clearTimeout(timeoutId);
      isScraping = false;
      reject(error);
    }
  });
}

/**
 * Internal: Scrape the current thread page
 */
function _scrapeThreadData(): RedditThread | null {
  // Get thread/post data
  const threadElement = document.querySelector(SELECTORS.threadContainer.new);
  if (!threadElement) {
    console.error('Could not find thread container');
    return null;
  }

  // Extract thread metadata
  const postId = _generateId('post');
  const title = _extractThreadTitle();
  const author = _extractThreadAuthor();
  const subreddit = _extractSubreddit();
  const content = _extractThreadContent();
  const score = _extractThreadScore();
  const timestamp = _extractThreadTimestamp();
  const url = window.location.href;

  // Scrape all comments
  const comments: RedditComment[] = [];
  const commentMap = new Map<string, RedditComment>();

  // Find all comment elements
  const commentElements = querySelectorAll(document, [
    SELECTORS.comment.new,
    SELECTORS.comment.old,
    SELECTORS.comment.fallback,
  ]);

  // Build comment tree
  commentElements.forEach((commentEl, index) => {
    try {
      const comment = _parseComment(commentEl, index, null);
      if (comment) {
        comments.push(comment);
        commentMap.set(comment.id, comment);
      }
    } catch (error) {
      console.warn('Failed to parse comment:', error);
    }
  });

  // Establish parent-child relationships
  _establishCommentHierarchy(comments, commentElements);

  return {
    id: postId,
    title,
    author,
    subreddit,
    content,
    score,
    timestamp,
    comments,
    commentCount: comments.length,
    url,
    scrapeTimestamp: new Date().toISOString(),
  };
}

/**
 * Parse a single comment element
 */
function _parseComment(
  element: Element,
  index: number,
  parentId: string | null,
): RedditComment | null {
  // Skip if deleted/removed
  if (isCommentDeleted(element)) {
    return null;
  }

  const id = element.getAttribute('data-comment-id') || _generateId(`comment-${index}`);
  const author = _extractCommentAuthor(element);
  const content = _extractCommentContent(element);
  const score = _extractCommentScore(element);
  const timestamp = _extractCommentTimestamp(element);
  const edited = isCommentEdited(element);
  const isOP = _isOriginalPoster(element);
  const depth = _calculateCommentDepth(element);

  return {
    id,
    author: author || '[deleted]',
    content: content || '[deleted]',
    score,
    timestamp,
    parentId,
    depth,
    edited,
    isOP,
    awards: [],
    childrenIds: [],
  };
}

/**
 * Extract thread title
 */
function _extractThreadTitle(): string {
  const titleEl = querySelector(document, [
    'h1',
    '[data-testid="post-title"]',
    '.title a',
  ]);
  return titleEl ? extractText(titleEl) : 'Unknown Thread';
}

/**
 * Extract thread author
 */
function _extractThreadAuthor(): string {
  const authorEl = querySelector(document, [
    '[data-testid="post-author-top"]',
    'a[href^="/user/"]',
    '.author',
  ]);
  return authorEl ? extractText(authorEl) : 'Unknown';
}

/**
 * Extract subreddit name
 */
function _extractSubreddit(): string {
  const subredditEl = querySelector(document, [
    '[data-testid="subreddit-name"]',
    'a[href^="/r/"]',
  ]);

  if (subredditEl) {
    const text = extractText(subredditEl);
    return text.replace(/^r\//, '');
  }

  // Fallback from URL
  const match = window.location.pathname.match(/\/r\/([^/]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Extract thread body content
 */
function _extractThreadContent(): string {
  const contentEl = querySelector(document, [
    '[data-testid="post-content"] p',
    '.md',
    '[data-testid="post-content"]',
  ]);
  return contentEl ? extractText(contentEl) : '';
}

/**
 * Extract thread score
 */
function _extractThreadScore(): number {
  const scoreEl = querySelector(document, [
    '[aria-label*="upvote"]',
    '.score',
    '[data-testid="vote-counter"]',
  ]);
  return scoreEl ? extractScore(scoreEl) : 0;
}

/**
 * Extract thread timestamp
 */
function _extractThreadTimestamp(): string {
  const timeEl = querySelector(document, ['time']);
  return extractTimestamp(timeEl);
}

/**
 * Extract comment author
 */
function _extractCommentAuthor(element: Element): string {
  const authorEl = querySelector(element, [
    'a[data-testid="comment-author-link"]',
    '.author',
    'a[href*="/user/"]',
  ]);
  return authorEl ? extractText(authorEl).replace(/u\//, '') : 'Unknown';
}

/**
 * Extract comment content
 */
function _extractCommentContent(element: Element): string {
  const contentEl = querySelector(element, [
    'div[data-testid="comment"] ~ div p',
    '.md',
    'p',
  ]);
  return contentEl ? extractText(contentEl) : '';
}

/**
 * Extract comment score
 */
function _extractCommentScore(element: Element): number {
  const scoreEl = querySelector(element, [
    '[aria-label*="upvote"]',
    '.score',
  ]);
  return scoreEl ? extractScore(scoreEl) : 0;
}

/**
 * Extract comment timestamp
 */
function _extractCommentTimestamp(element: Element): string {
  const timeEl = querySelector(element, [
    'a[data-testid="comment-timestamp"]',
    'time',
  ]);
  return extractTimestamp(timeEl);
}

/**
 * Check if author is OP (original poster)
 */
function _isOriginalPoster(element: Element): boolean {
  return (
    element.querySelector('[data-testid="comment-author-is-op"]') !== null ||
    element.querySelector('.op') !== null ||
    extractText(element).includes('[OP]')
  );
}

/**
 * Calculate nesting depth from element position
 */
function _calculateCommentDepth(element: Element): number {
  let depth = 0;
  let parent = element.parentElement;

  while (parent && parent !== document.body) {
    if (parent.querySelector(SELECTORS.comment.new) === element) {
      depth++;
    }
    parent = parent.parentElement;
  }

  return depth;
}

/**
 * Establish parent-child relationships in comment hierarchy
 */
function _establishCommentHierarchy(
  comments: RedditComment[],
  commentElements: Element[],
): void {
  const elementToComment = new Map<Element, RedditComment>();

  comments.forEach((comment, index) => {
    elementToComment.set(commentElements[index], comment);
  });

  // Simple approach: assume comments in list order reflect nesting
  // Child comments have greater depth than their parent
  for (let i = 0; i < comments.length; i++) {
    if (i > 0) {
      const current = comments[i];
      const prev = comments[i - 1];

      // If current depth > prev depth, current is child of prev
      if (current.depth > prev.depth) {
        current.parentId = prev.id;
        prev.childrenIds.push(current.id);
      } else if (current.depth <= prev.depth) {
        // Find the nearest parent with lesser depth
        for (let j = i - 1; j >= 0; j--) {
          if (comments[j].depth < current.depth) {
            current.parentId = comments[j].id;
            comments[j].childrenIds.push(current.id);
            break;
          }
        }
      }
    }
  }
}

/**
 * Generate unique ID
 */
function _generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cancel ongoing scrape
 */
export function cancelScrape(): void {
  isScraping = false;
}
