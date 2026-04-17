import React, { useState, useCallback } from 'react';
import { AiAssistantConfig, ThemeConfig, AskResponse } from './types';

interface AiAssistantProps {
  config: AiAssistantConfig;
  theme?: ThemeConfig;
  open?: boolean;
  onClose?: () => void;
}

/**
 * AI 助手弹窗组件
 *
 * 注意：这是一个简化的基础组件，实际使用时建议：
 * 1. 使用 UI 库（Ant Design、Material-UI 等）
 * 2. 添加 Markdown 渲染
 * 3. 添加加载状态和错误处理
 * 4. 优化样式和交互
 */
export const AiAssistant: React.FC<AiAssistantProps> = ({
  config,
  theme,
  open = false,
  onClose,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const q = question.trim();
    if (q.length < 2) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const isArticle = Boolean(config.articleId);
      const endpoint = isArticle ? '/ask' : '/chat';
      const body = isArticle
        ? { articleId: config.articleId, question: q }
        : { question: q };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (config.authToken) {
        headers.Authorization = `Bearer ${config.authToken}`;
      }

      const res = await fetch(`${config.apiBase}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.code === 0 && data.data) {
        setResult(data.data);
      } else {
        setError(data.message || 'Request failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [question, config]);

  const handleClose = useCallback(() => {
    setQuestion('');
    setResult(null);
    setError(null);
    onClose?.();
  }, [onClose]);

  if (!open) return null;

  const primary = theme?.primary || '#1890ff';
  const borderRadius = theme?.borderRadius || 12;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          background: '#fff',
          borderRadius: `${borderRadius}px`,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              AI Assistant
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
              {config.articleId
                ? `Ask about: ${config.articleTitle || 'this article'}`
                : 'General Q&A'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: '#f5f5f5',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Your Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe your question..."
              rows={4}
              maxLength={800}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: `${borderRadius}px`,
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={question.trim().length < 2 || loading}
            style={{
              padding: '10px 24px',
              background: primary,
              color: '#fff',
              border: 'none',
              borderRadius: `${borderRadius}px`,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              opacity: question.trim().length < 2 || loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Thinking...' : 'Submit'}
          </button>

          {error && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: `${borderRadius}px`,
                color: '#cf1322',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: '24px' }}>
              {result.meta?.answerMode === 'freeform' && (
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    borderRadius: `${borderRadius}px`,
                    fontSize: '13px',
                    color: '#0050b3',
                  }}
                >
                  ℹ️ General answer (not based on article content)
                </div>
              )}

              <div
                style={{
                  padding: '16px',
                  background: '#fafafa',
                  borderRadius: `${borderRadius}px`,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {result.answer}
              </div>

              {result.citations && result.citations.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Citations
                  </h4>
                  {result.citations.map((citation, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: '12px',
                        padding: '12px',
                        background: '#f5f5f5',
                        borderRadius: `${borderRadius}px`,
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ marginBottom: '8px', color: '#666' }}>
                        {citation.excerpt}
                      </div>
                      <div style={{ fontSize: '12px', color: primary }}>
                        {citation.source === 'category' && citation.articleTitle
                          ? `From: ${citation.articleTitle}`
                          : 'From current article'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
