import { useCallback, useEffect, useState } from 'react';
import { Button } from 'antd';
import ReactMarkdown from 'react-markdown';
import { Loader2, Sparkles, X } from 'lucide-react';
import type { SubmitAnswerVO } from '../types';
import { streamDeepAnalysis } from '../utils/streamChat';
import { toast } from '../utils/toast';
import { useColors } from '../context/themeHooks';

interface AiAnalysisPanelProps {
  submitResult: SubmitAnswerVO;
}

export function AiAnalysisPanel({ submitResult }: AiAnalysisPanelProps) {
  const colors = useColors();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);

  const handleAiAnalysis = useCallback(() => {
    setAiAnalysis('');
    setIsAiStreaming(true);

    const ctrl = streamDeepAnalysis(
      submitResult.submitId,
      (token) => setAiAnalysis(prev => prev + token),
      () => setIsAiStreaming(false),
      () => {
        setIsAiStreaming(false);
        toast.error('AI 分析失败，请重试');
      },
      () => setAiAnalysis(''),
    );
    window.__aiPlayCtrl = ctrl;
  }, [submitResult.submitId]);

  useEffect(() => {
    return () => { window.__aiPlayCtrl?.abort(); };
  }, []);

  return (
    <div style={{ marginTop: 16 }}>
      {!isAiStreaming && !aiAnalysis && (
        <Button className="ai-deep-btn" onClick={handleAiAnalysis} icon={<Sparkles size={14} />}>
          AI 深度解析
        </Button>
      )}
      {isAiStreaming && (
        <div className="ai-loading-row">
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          AI 分析中...
        </div>
      )}
      {aiAnalysis && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <span className="ai-panel-title">AI 深度解析</span>
            <button className="ai-close-button" onClick={() => setAiAnalysis('')} aria-label="关闭 AI 解析">
              <X size={13} />
            </button>
          </div>
          <ReactMarkdown
            components={{
              p({ children }) {
                return <p style={{ margin: '4px 0' }}>{children}</p>;
              },
              ul({ children }) {
                return <ul style={{ margin: '4px 0', paddingLeft: 20 }}>{children}</ul>;
              },
              li({ children }) {
                return <li style={{ margin: '2px 0' }}>{children}</li>;
              },
              strong({ children }) {
                return <strong style={{ color: colors.gray900 }}>{children}</strong>;
              },
              pre({ children }: React.ComponentPropsWithoutRef<'pre'>) {
                return <pre style={{ background: colors.gray800, color: '#e4e4e7', borderRadius: 8, padding: 12, overflow: 'auto', fontSize: 13, lineHeight: 1.5, margin: '6px 0' }}>{children}</pre>;
              },
              code({ className, children, ...props }) {
                const isBlock = /language-(\w+)/.exec(className || '');
                return isBlock ? (
                  <code className={className} style={{ fontSize: 13 }} {...props}>{children}</code>
                ) : (
                  <code style={{ background: colors.gray100, padding: '1px 5px', borderRadius: 4, fontSize: 13 }} {...props}>{children}</code>
                );
              },
              a({ href, children }) {
                return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary }}>{children}</a>;
              },
            }}
          >
            {aiAnalysis}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
