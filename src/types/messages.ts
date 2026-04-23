import type { RedditThread } from './reddit';

export type MessageRequest =
  | { type: 'SCRAPE_THREAD' }
  | { type: 'CANCEL_SCRAPE' };

export type MessageResponse =
  | { success: true; data: RedditThread }
  | { success: false; error: string };
