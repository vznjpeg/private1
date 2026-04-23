import { useEffect, useState } from 'react';
import type { RedditThread } from '../types/reddit';
import ThreadViewer from './components/ThreadViewer';
import ExportOptions from './components/ExportOptions';
import DarkModeToggle from './components/DarkModeToggle';

type AppState = 'idle' | 'scraping' | 'success' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [thread, setThread] = useState<RedditThread | null>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Load dark mode preference
  useEffect(() => {
    chrome.storage.local.get('darkMode', result => {
      if (result.darkMode !== undefined) {
        setDarkMode(result.darkMode);
      }
    });
  }, []);

  // Apply dark mode
  useEffect(() => {
    chrome.storage.local.set({ darkMode });
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleScrape = async () => {
    setState('scraping');
    setError('');
    setProgress(0);

    try {
      // Get current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab.id) {
        throw new Error('No active tab found');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 200);

      // Send message to service worker
      const response = await chrome.runtime.sendMessage({
        type: 'SCRAPE_THREAD',
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setThread(response.data);
        setState('success');
      } else {
        throw new Error(response.error || 'Scraping failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      setState('error');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setState('idle');
    setThread(null);
    setError('');
    setProgress(0);
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Reddit Scraper</h1>
        <DarkModeToggle enabled={darkMode} onChange={setDarkMode} />
      </div>

      {state === 'idle' && (
        <div className="idle-state">
          <p>Click below to scrape the current Reddit thread</p>
          <button className="btn btn-primary" onClick={handleScrape}>
            Scrape Current Thread
          </button>
        </div>
      )}

      {state === 'scraping' && (
        <div className="scraping-state">
          <div className="spinner"></div>
          <p>Scraping thread...</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{Math.round(progress)}%</p>
        </div>
      )}

      {state === 'error' && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={handleReset}>
            Try Again
          </button>
        </div>
      )}

      {state === 'success' && thread && (
        <div className="success-state">
          <div className="thread-info">
            <h2>{thread.title}</h2>
            <p className="meta">
              r/{thread.subreddit} • u/{thread.author} • {thread.comments.length} comments
            </p>
          </div>

          <ThreadViewer comments={thread.comments} />

          <ExportOptions thread={thread} />

          <button className="btn btn-secondary" onClick={handleReset}>
            Scrape Another Thread
          </button>
        </div>
      )}
    </div>
  );
}
