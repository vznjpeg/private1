export interface Award {
  name: string;
  count: number;
}

export interface RedditComment {
  id: string;
  author: string;
  content: string;
  score: number;
  timestamp: string;
  parentId?: string;
  depth: number;
  awards?: Award[];
  edited: boolean;
  isOP: boolean;
  childrenIds: string[];
}

export interface RedditThread {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  content: string;
  score: number;
  timestamp: string;
  comments: RedditComment[];
  commentCount: number;
  url: string;
  scrapeTimestamp: string;
}
