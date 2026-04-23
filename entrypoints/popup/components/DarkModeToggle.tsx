interface DarkModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function DarkModeToggle({ enabled, onChange }: DarkModeToggleProps) {
  return (
    <button
      className="dark-mode-toggle"
      onClick={() => onChange(!enabled)}
      title={enabled ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
    >
      {enabled ? '🌙' : '☀️'}
    </button>
  );
}
