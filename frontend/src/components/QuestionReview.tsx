import React, { useState, useCallback, useEffect } from 'react';
import { Button, Space, Tag } from 'antd';
import type { QuestionDetailVO, UserSubmitVO } from '../types';
import { useColors } from '../context/themeHooks';
import ReactMarkdown from 'react-markdown';
import { streamDeepAnalysis } from '../utils/streamChat';
import { toast } from '../utils/toast';
import { Sparkles, Loader2, Check, X } from 'lucide-react';

interface Props {
  question: QuestionDetailVO;
  record: UserSubmitVO | null;
  onBack: () => void;
  prevSubmitId: string | null;
  nextSubmitId: string | null;
  onGoToSubmit: (submitId: string) => void;
}

export const QuestionReview: React.FC<Props> = ({
  question, record, onBack,
  prevSubmitId, nextSubmitId, onGoToSubmit
}) => {
  const colors = useColors();
  const selectedOption = record?.selectedOptionLabel || '';
  const correctOption = record?.correctOptionLabel || '';
  const isCorrect = record?.isCorrect === 1;
  const score = record?.score || '0';
  const createTime = record?.createTime || '';
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);

  useEffect(() => {
    window.__aiReviewCtrl?.abort();
    queueMicrotask(() => {
      setAiAnalysis('');
      setIsAiStreaming(false);
    });
  }, [question.id, record?.submitId]);

  const handleAiAnalysis = useCallback(() => {
    if (!record) return;
    setAiAnalysis('');
    setIsAiStreaming(true);

    const ctrl = streamDeepAnalysis(
      record.submitId,
      (token) => setAiAnalysis(prev => prev + token),
      () => setIsAiStreaming(false),
      () => {
        setIsAiStreaming(false);
        toast.error('AI 分析失败，请重试');
      },
      () => setAiAnalysis(''),
    );
    window.__aiReviewCtrl = ctrl;
  }, [record]);

  useEffect(() => {
    return () => { window.__aiReviewCtrl?.abort(); };
  }, []);

  return (
    <div className="review-shell question-enter">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="filter-group">
            <h1 className="page-hero-title">回顾历史题目</h1>
            <Tag color="default">只读</Tag>
            {record && <Tag color={isCorrect ? 'success' : 'error'}>{isCorrect ? '当时正确' : '当时错误'}</Tag>}
          </div>
          <Button type="text" size="small" onClick={onBack}>返回历史</Button>
        </div>
      </div>

      <h2 className="question-title" style={{ marginBottom: 12 }}>{question.title}</h2>
      {question.content && <div className="question-content-card">{question.content}</div>}

      <div className="option-list">
        {question.options?.map(opt => {
          const isUserSelected = selectedOption === opt.optionLabel;
          const isCorrectAnswer = correctOption === opt.optionLabel;
          let bg = colors.surface;
          let borderColor = colors.ringSubtle;
          let textColor = colors.gray800;
          let labelBg = colors.surface;
          let labelColor = colors.gray600;
          let labelRing = colors.gray300;
          if (isCorrectAnswer) { bg = colors.successBg; borderColor = colors.success; textColor = colors.successHover; }
          if (isCorrectAnswer) { labelBg = colors.success; labelColor = '#fff'; labelRing = colors.success; }
          else if (isUserSelected && !isCorrect) {
            bg = colors.errorBg;
            borderColor = colors.error;
            textColor = colors.errorHover;
            labelBg = colors.error;
            labelColor = '#fff';
            labelRing = colors.error;
          }

          return (
            <div key={opt.optionLabel} className="review-option" style={{ background: bg, boxShadow: `0 0 0 1.5px ${borderColor}`, color: textColor }}>
              <div className="review-option-main">
                <span className="option-label" style={{ background: labelBg, boxShadow: `0 0 0 1px ${labelRing}`, color: labelColor }}>{opt.optionLabel}</span>
                <span className="option-text" style={{ fontWeight: isCorrectAnswer || (isUserSelected && !isCorrect) ? 600 : 400 }}>
                  {opt.optionContent}
                </span>
              </div>
              <Space className="review-option-tags" size={4}>
                {isCorrectAnswer && <Tag color="success">正确答案</Tag>}
                {isUserSelected && <Tag color={isCorrect ? 'success' : 'error'}>您的选择</Tag>}
              </Space>
            </div>
          );
        })}
      </div>

      {record && (
        <div className="review-result-card" style={{ background: isCorrect ? colors.successBg : colors.errorBg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="result-icon" style={{ width: 20, height: 20, background: isCorrect ? colors.success : colors.error }}>
              {isCorrect ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
            </span>
            <span style={{ fontWeight: 600, fontSize: 14, color: isCorrect ? colors.successHover : colors.errorHover }}>
              答题结果：{isCorrect ? '正确' : '错误'}
            </span>
          </div>
          <div style={{ color: colors.gray600, fontSize: 13 }}>
            {createTime.replace('T', ' ')} · 得分 <span style={{ fontWeight: 600, color: colors.gray800 }}>{score} 分</span>
          </div>
        </div>
      )}

      {record?.analysis && (
        <div className="content-card" style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: colors.gray800, marginBottom: 8, fontSize: 14 }}>题目深度解析</div>
          <div style={{ color: colors.gray600, lineHeight: 1.7, fontSize: 14 }}>{record.analysis}</div>
        </div>
      )}

      {record && (
        <div style={{ marginBottom: 24 }}>
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
      )}

      <div className="review-footer-actions">
        <Button disabled={prevSubmitId === null} onClick={() => prevSubmitId && onGoToSubmit(prevSubmitId)}>上一条</Button>
        <Button type="dashed" disabled>历史回顾模式</Button>
        <Button disabled={nextSubmitId === null} onClick={() => nextSubmitId && onGoToSubmit(nextSubmitId)}>下一条</Button>
      </div>
    </div>
  );
};
