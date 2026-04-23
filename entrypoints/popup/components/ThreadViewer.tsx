import { useState } from 'react';
import type { RedditComment } from '~/types/reddit';

interface ThreadViewerProps {
  comments: RedditComment[];
}

export default function ThreadViewer({ comments }: ThreadViewerProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getRootComments = () => {
    return comments.filter(c => !c.parentId);
  };

  const getChildComments = (parentId: string) => {
    return comments.filter(c => c.parentId === parentId);
  };

  return (
    <div className="thread-viewer">
      <div className="comments-list">
        {getRootComments().map(comment => (
          <CommentNode
            key={comment.id}
            comment={comment}
            expanded={expandedIds.has(comment.id)}
            onToggle={toggleExpanded}
            getChildComments={getChildComments}
            expandedIds={expandedIds}
          />
        ))}
      </div>
    </div>
  );
}

interface CommentNodeProps {
  comment: RedditComment;
  expanded: boolean;
  onToggle: (id: string) => void;
  getChildComments: (parentId: string) => RedditComment[];
  expandedIds: Set<string>;
}

function CommentNode({
  comment,
  expanded,
  onToggle,
  getChildComments,
  expandedIds,
}: CommentNodeProps) {
  const children = getChildComments(comment.id);
  const hasChildren = children.length > 0;

  return (
    <div className="comment-node">
      <div
        className="comment-header"
        style={{ paddingLeft: `${comment.depth * 12}px` }}
      >
        {hasChildren && (
          <button
            className="expand-btn"
            onClick={() => onToggle(comment.id)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="expand-placeholder"></span>}

        <div className="author-info">
          <span className="author">u/{comment.author}</span>
          {comment.isOP && <span className="op-badge">OP</span>}
          <span className="score">{comment.score} ↑</span>
          {comment.edited && <span className="edited-tag">edited</span>}
        </div>
      </div>

      <div
        className="comment-content"
        style={{ paddingLeft: `${comment.depth * 12 + 24}px` }}
      >
        <p>{comment.content}</p>
        <div className="timestamp">{formatDate(comment.timestamp)}</div>
      </div>

      {hasChildren && expanded && (
        <div className="comment-children">
          {children.map(child => (
            <CommentNode
              key={child.id}
              comment={child}
              expanded={expandedIds.has(child.id)}
              onToggle={onToggle}
              getChildComments={getChildComments}
              expandedIds={expandedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
