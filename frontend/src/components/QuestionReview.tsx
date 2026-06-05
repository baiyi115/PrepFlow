import React, { useState, useCallback, useEffect } from 'react';
import { Button, Space, Tag } from 'antd';
import type { QuestionDetailVO, UserSubmitVO } from '../types';
import { useColors } from '../context/ThemeContext';
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
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ background: colors.gray100, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: colors.gray900 }}>回顾历史题目</h2>
            <Tag color="default" style={{ borderRadius: 6 }}>只读</Tag>
            {record && <Tag color={isCorrect ? 'success' : 'error'} style={{ borderRadius: 6 }}>{isCorrect ? '当时正确' : '当时错误'}</Tag>}
          </div>
          <Button type="text" size="small" onClick={onBack} style={{ color: colors.gray500 }}>返回历史</Button>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.gray900, marginBottom: 8 }}>{question.title}</h3>
      {question.content && (
        <div style={{
          fontSize: 15, color: colors.gray600, marginBottom: 24, padding: '18px 22px',
          background: colors.gray100, borderRadius: 12, whiteSpace: 'pre-wrap', lineHeight: 1.7,
        }}>
          {question.content}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {question.options?.map(opt => {
          const isUserSelected = selectedOption === opt.optionLabel;
          const isCorrectAnswer = correctOption === opt.optionLabel;
          let bg: string = colors.gray100;
          let borderColor: string = colors.gray200;
          let textColor: string = colors.gray800;
          if (isCorrectAnswer) { bg = colors.successBg; borderColor = colors.success; textColor = colors.successHover; }
          else if (isUserSelected && !isCorrect) { bg = colors.errorBg; borderColor = colors.error; textColor = colors.errorHover; }

          return (
            <div key={opt.optionLabel} style={{
              padding: '14px 18px', borderRadius: 10, background: bg,
              border: '1.5px solid', borderColor, cursor: 'default',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              color: textColor, fontWeight: isCorrectAnswer || (isUserSelected && !isCorrect) ? 600 : 400,
            }}>
              <span>{opt.optionLabel}. {opt.optionContent}</span>
              <Space size={4}>
                {isCorrectAnswer && <Tag color="success" style={{ borderRadius: 6 }}>正确答案</Tag>}
                {isUserSelected && <Tag color={isCorrect ? 'success' : 'error'} style={{ borderRadius: 6 }}>您的选择</Tag>}
              </Space>
            </div>
          );
        })}
      </div>

      {record && (
        <div style={{
          padding: 16, borderRadius: 12, marginBottom: 24,
          background: isCorrect ? colors.successBg : colors.errorBg,
          border: `1px solid ${isCorrect ? colors.success : colors.error}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 20, height: 20, borderRadius: '50%',
              background: isCorrect ? colors.success : colors.error,
              color: '#fff',
            }}>
              {isCorrect ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
            </span>
            <span style={{ fontWeight: 600, fontSize: 14, color: isCorrect ? colors.successHover : colors.errorHover }}>
              答题结果：{isCorrect ? '正确' : '错误'}
            </span>
          </div>
          <div style={{ color: colors.gray600, fontSize: 13 }}>
            {createTime.replace('T', ' ')} · 得分：<span style={{ fontWeight: 600, color: colors.gray800 }}>{score} 分</span>
          </div>
        </div>
      )}

      {record?.analysis && (
        <div style={{ padding: 16, background: colors.gray100, borderRadius: 12, border: `1px solid ${colors.gray200}`, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: colors.gray800, marginBottom: 8, fontSize: 14 }}>题目深度解析</div>
          <div style={{ color: colors.gray600, lineHeight: 1.7, fontSize: 14 }}>{record.analysis}</div>
        </div>
      )}

      <style>{`
        .ai-deep-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          background: ${colors.primaryBg} !important;
          border-color: ${colors.primaryBorder} !important;
          color: ${colors.primary} !important;
          transition: all 0.2s !important;
        }
        .ai-deep-btn:not(:disabled):hover {
          background: ${colors.primary} !important;
          border-color: ${colors.primary} !important;
          color: #fff !important;
        }
      `}</style>
      {record && (
        <div style={{ marginBottom: 24 }}>
          {!isAiStreaming && !aiAnalysis && (
            <Button
              className="ai-deep-btn"
              onClick={handleAiAnalysis}
              icon={<Sparkles size={14} />}
            >
              AI 深度解析
            </Button>
          )}
          {isAiStreaming && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: colors.gray500 }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              AI 分析中...
            </div>
          )}
          {aiAnalysis && (
            <div style={{
              marginTop: 8, padding: 14, borderRadius: 10, position: 'relative',
              background: colors.gray50, border: `1px solid ${colors.gray200}`,
              fontSize: 14, lineHeight: 1.8, color: colors.gray700,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: colors.primary, fontSize: 13 }}>AI 深度解析</span>
                <span
                  onClick={() => setAiAnalysis('')}
                  style={{
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: 6,
                    color: colors.gray400, transition: 'all 0.15s', userSelect: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = colors.primaryBg; e.currentTarget.style.color = colors.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.gray400; }}
                >
                  <X size={13} />
                </span>
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

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={prevSubmitId === null} onClick={() => prevSubmitId && onGoToSubmit(prevSubmitId)}>上一条</Button>
        <Button type="dashed" disabled style={{ borderRadius: 10 }}>历史回顾模式</Button>
        <Button disabled={nextSubmitId === null} onClick={() => nextSubmitId && onGoToSubmit(nextSubmitId)}>下一条</Button>
      </div>
    </div>
  );
};
