/**
 * Robust DOM selectors for Reddit's constantly changing structure
 * Provides multiple fallback options for different Reddit layouts
 */

export const SELECTORS = {
  // Thread/post container
  threadContainer: {
    new: '[data-testid="post-container"]',
    old: '#siteTable > .thing',
  },

  // Comments section
  commentsSection: {
    new: '[data-testid="comments-page"]',
    old: '#siteTable > .comment',
  },

  // Individual comment
  comment: {
    new: '[data-testid="comment"]',
    old: '.comment',
    fallback: '[role="article"]',
  },

  // Comment body/content
  commentBody: {
    new: 'div[data-testid="comment"] p',
    old: '.md',
    fallback: '[data-testid="comment"] ~ div p',
  },

  // Author username
  author: {
    new: 'a[data-testid="comment-author-link"]',
    old: '.author',
    fallback: 'a[href*="/user/"]',
  },

  // Comment score
  score: {
    new: '[aria-label*="upvote"]',
    old: '.score',
    fallback: '[role="button"][aria-label*="upvote"]',
  },

  // Timestamp
  timestamp: {
    new: 'a[data-testid="comment-timestamp"]',
    old: 'time',
    fallback: 'time',
  },

  // Nested replies toggle/container
  childComments: {
    new: '[data-testid="comment"] ~ div[role="complementary"]',
    old: '.child',
    fallback: '[data-comment-id] ~ [data-comment-id]',
  },

  // Comment ID attribute
  commentIdAttr: 'data-comment-id',
};

/**
 * Try multiple selectors until one matches
 */
export function querySelector(
  root: Element,
  selectors: string | string[],
): Element | null {
  const selectorList = typeof selectors === 'string' ? [selectors] : selectors;

  for (const selector of selectorList) {
    try {
      const element = root.querySelector(selector);
      if (element) return element;
    } catch {
      // Invalid selector, try next
      continue;
    }
  }

  return null;
}

/**
 * Query all elements with multiple selector fallbacks
 */
export function querySelectorAll(
  root: Element,
  selectors: string | string[],
): Element[] {
  const selectorList = typeof selectors === 'string' ? [selectors] : selectors;

  for (const selector of selectorList) {
    try {
      const elements = root.querySelectorAll(selector);
      if (elements.length > 0) return Array.from(elements);
    } catch {
      // Invalid selector, try next
      continue;
    }
  }

  return [];
}

/**
 * Extract text content, handling Reddit's nested elements
 */
export function extractText(element: Element | null): string {
  if (!element) return '';

  // Clone to avoid side effects
  const clone = element.cloneNode(true) as Element;

  // Remove collapsed/hidden content indicators
  clone.querySelectorAll('[style*="display: none"]').forEach(el => el.remove());
  clone.querySelectorAll('.collapse-toggle').forEach(el => el.remove());

  return clone.textContent?.trim() || '';
}

/**
 * Extract number from score element (e.g., "123 upvotes" -> 123)
 */
export function extractScore(element: Element | null): number {
  if (!element) return 0;

  const text = element.getAttribute('aria-label') || element.textContent || '';
  const match = text.match(/(\d+)/);

  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extract timestamp ISO string from time element or attribute
 */
export function extractTimestamp(element: Element | null): string {
  if (!element) return new Date().toISOString();

  // Try datetime attribute first (most reliable)
  const datetime = element.getAttribute('datetime');
  if (datetime) return datetime;

  // Try aria-label (contains human-readable time)
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    try {
      const date = new Date(ariaLabel);
      if (!isNaN(date.getTime())) return date.toISOString();
    } catch {
      // Fall through
    }
  }

  // Fallback to title attribute
  const title = element.getAttribute('title');
  if (title) {
    try {
      const date = new Date(title);
      if (!isNaN(date.getTime())) return date.toISOString();
    } catch {
      // Fall through
    }
  }

  return new Date().toISOString();
}

/**
 * Check if element is marked as deleted/removed
 */
export function isCommentDeleted(element: Element): boolean {
  const text = element.textContent?.toLowerCase() || '';
  return (
    text.includes('[deleted]') ||
    text.includes('[removed]') ||
    element.querySelector('[data-testid="deleted-comment"]') !== null
  );
}

/**
 * Check if this is a deleted/removed comment
 */
export function isCommentEdited(element: Element): boolean {
  const text = element.textContent || '';
  return text.includes('(edited');
}
