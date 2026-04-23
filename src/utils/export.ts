import type { RedditThread, RedditComment } from '../types/reddit';

/**
 * Export thread data as CSV
 */
export function exportAsCSV(thread: RedditThread): string {
  const headers = [
    'Comment ID',
    'Author',
    'Content',
    'Score',
    'Depth',
    'Parent ID',
    'Timestamp',
    'Edited',
    'Is OP',
  ];

  const rows = thread.comments.map(comment => [
    comment.id,
    `"${comment.author.replace(/"/g, '""')}"`,
    `"${comment.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    comment.score,
    comment.depth,
    comment.parentId || '',
    comment.timestamp,
    comment.edited ? 'Yes' : 'No',
    comment.isOP ? 'Yes' : 'No',
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join(
    '\n',
  );

  return csvContent;
}

/**
 * Export thread data as JSON
 */
export function exportAsJSON(thread: RedditThread): string {
  return JSON.stringify(thread, null, 2);
}

/**
 * Flatten comments for text-based export
 */
export function flattenComments(comments: RedditComment[]): string {
  const lines: string[] = [];

  comments.forEach(comment => {
    const indent = '  '.repeat(comment.depth);
    const opTag = comment.isOP ? '[OP] ' : '';
    const editedTag = comment.edited ? ' (edited)' : '';

    lines.push(`${indent}${opTag}${comment.author} (${comment.score} upvotes)`);
    lines.push(`${indent}${comment.content}${editedTag}`);
    lines.push(`${indent}${comment.timestamp}`);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Create downloadable blob and trigger download
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Copy content to clipboard
 */
export async function copyToClipboard(content: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(content);
  } catch (error) {
    // Fallback for older browsers or restricted contexts
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(thread: RedditThread, format: 'csv' | 'json'): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedTitle = thread.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);

  return `reddit-${thread.subreddit}-${sanitizedTitle}-${timestamp}.${format}`;
}
