import React from 'react';
import { ThemeConfig } from './types';

interface AiButtonProps {
  onClick: () => void;
  theme?: ThemeConfig;
  className?: string;
}

/**
 * AI 助手悬浮按钮
 */
export const AiButton: React.FC<AiButtonProps> = ({ onClick, theme, className = '' }) => {
  const [pulse, setPulse] = React.useState(false);

  React.useEffect(() => {
    try {
      const key = 'blog_ai_assistant_hint_v1';
      if (!localStorage.getItem(key)) {
        setPulse(true);
        const timer = setTimeout(() => {
          setPulse(false);
          try {
            localStorage.setItem(key, '1');
          } catch {
            // ignore
          }
        }, 6000);
        return () => clearTimeout(timer);
      }
    } catch {
      setPulse(false);
    }
    return undefined;
  }, []);

  const primary = theme?.primary || '#1890ff';
  const gradient = theme?.gradient || `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)`;
  const borderRadius = theme?.borderRadius || 12;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`ai-assistant-button ${pulse ? 'pulse' : ''} ${className}`}
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        width: '56px',
        height: '56px',
        borderRadius: `${borderRadius}px`,
        background: gradient,
        border: 'none',
        color: '#fff',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: `0 4px 18px ${primary}55`,
        transition: 'all 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Open AI Assistant"
    >
      🤖
    </button>
  );
};
