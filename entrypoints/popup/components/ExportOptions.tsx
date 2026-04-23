import { useState } from 'react';
import type { RedditThread } from '../../types/reddit';
import {
  exportAsCSV,
  exportAsJSON,
  flattenComments,
  downloadFile,
  copyToClipboard,
  generateFilename,
} from '../../utils/export';

interface ExportOptionsProps {
  thread: RedditThread;
}

export default function ExportOptions({ thread }: ExportOptionsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  const handleCopyJSON = async () => {
    try {
      setExporting(true);
      const json = exportAsJSON(thread);
      await copyToClipboard(json);
      setCopied('json');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyText = async () => {
    try {
      setExporting(true);
      const text = flattenComments(thread.comments);
      await copyToClipboard(text);
      setCopied('text');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadCSV = () => {
    try {
      setExporting(true);
      const csv = exportAsCSV(thread);
      const filename = generateFilename(thread, 'csv');
      downloadFile(csv, filename, 'text/csv');
      setTimeout(() => setExporting(false), 500);
    } catch (err) {
      alert('Failed to download CSV');
      setExporting(false);
    }
  };

  const handleDownloadJSON = () => {
    try {
      setExporting(true);
      const json = exportAsJSON(thread);
      const filename = generateFilename(thread, 'json');
      downloadFile(json, filename, 'application/json');
      setTimeout(() => setExporting(false), 500);
    } catch (err) {
      alert('Failed to download JSON');
      setExporting(false);
    }
  };

  return (
    <div className="export-options">
      <h3>Export Options</h3>

      <div className="export-grid">
        <div className="export-group">
          <p className="export-label">Copy to Clipboard</p>
          <button
            className="btn btn-export"
            onClick={handleCopyJSON}
            disabled={exporting}
            title="Copy thread data as JSON"
          >
            {copied === 'json' ? '✓ Copied!' : 'JSON'}
          </button>
          <button
            className="btn btn-export"
            onClick={handleCopyText}
            disabled={exporting}
            title="Copy comments as formatted text"
          >
            {copied === 'text' ? '✓ Copied!' : 'Text'}
          </button>
        </div>

        <div className="export-group">
          <p className="export-label">Download File</p>
          <button
            className="btn btn-export"
            onClick={handleDownloadCSV}
            disabled={exporting}
            title="Download as CSV (Excel compatible)"
          >
            CSV
          </button>
          <button
            className="btn btn-export"
            onClick={handleDownloadJSON}
            disabled={exporting}
            title="Download as JSON"
          >
            JSON
          </button>
        </div>
      </div>

      {exporting && <p className="exporting-text">Preparing export...</p>}
    </div>
  );
}
