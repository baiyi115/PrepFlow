import React, { useEffect, useState, useCallback } from 'react';
import { Button } from 'antd';
import type { QuestionDetailVO, SubmitAnswerVO } from '../types';
import { useColors } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';
import { streamDeepAnalysis } from '../utils/streamChat';
import { toast } from '../utils/toast';
import { Sparkles, Loader2, Check, X } from 'lucide-react';

interface Props {
  question: QuestionDetailVO;
  selectedOption: string;
  submitResult: SubmitAnswerVO | null;
  onSelectOption: (optionLabel: string) => void;
  onSubmit: () => void;
  onGoToDetail: (id: string) => void;
  prevQuestionId: string | null;
  nextQuestionId: string | null;
  questionIndex?: number;
  totalQuestions?: number;
  originalIndex?: number;
  backText?: string;
  onBack?: () => void;
}

export const QuestionPlay: React.FC<Props> = ({
  question, selectedOption, onSelectOption, submitResult, onSubmit, onBack,
  prevQuestionId, nextQuestionId, questionIndex, totalQuestions, originalIndex, onGoToDetail, backText = '返回列表'
}) => {
  const colors = useColors();
  const hasSubmitted = !!submitResult;
  const hasPrevQuestion = !!prevQuestionId;
  const hasNextQuestion = !!nextQuestionId;
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);

  const handleAiAnalysis = useCallback(() => {
    if (!submitResult) return;
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
  }, [submitResult]);

  useEffect(() => {
    return () => { window.__aiPlayCtrl?.abort(); };
  }, []);

  useEffect(() => {
    if (question.questionType !== 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const key = e.key.toUpperCase();
      if (!hasSubmitted) {
        if (['A', 'B', 'C', 'D'].includes(key)) {
          if (question.options?.some(opt => opt.optionLabel === key)) onSelectOption(key);
        }
        if (key === 'ENTER' && selectedOption) onSubmit();
      } else if (hasNextQuestion && key === 'ENTER') {
        onGoToDetail(nextQuestionId!);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, hasSubmitted, question.options, question.questionType, onSubmit, onSelectOption, hasNextQuestion, nextQuestionId, onGoToDetail]);

  if (question.questionType !== 1) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', background: colors.gray100, borderRadius: 16 }}>
        <h3 style={{ color: colors.gray700, marginBottom: 8 }}>题型暂不支持</h3>
        <p style={{ color: colors.gray500, marginBottom: 24 }}>当前系统主要支持选择题</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button disabled={!hasPrevQuestion} onClick={() => hasPrevQuestion && onGoToDetail(prevQuestionId)}>上一题</Button>
          <Button disabled={!hasNextQuestion} onClick={() => hasNextQuestion && onGoToDetail(nextQuestionId)}>下一题</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: colors.gray500 }}>第 {questionIndex ?? '?'} / {totalQuestions ?? '?'} 题</span>
        {originalIndex !== undefined && <span style={{ fontSize: 12, color: colors.gray400 }}>题库第 {originalIndex} 题</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: colors.gray900, lineHeight: 1.5 }}>{question.title}</h2>
        <Button type="text" size="small" onClick={onBack} style={{ color: colors.gray400, whiteSpace: 'nowrap', flexShrink: 0 }}>{backText}</Button>
      </div>

      {question.content && (question.questionType !== 1 || question.content !== question.title) && (
        <div style={{
          fontSize: 15, color: colors.gray700, marginBottom: 32,
          padding: '20px 24px', background: colors.gray100, borderRadius: 12,
          whiteSpace: 'pre-wrap', lineHeight: 1.8,
        }}>
          {question.content}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        {question.options?.map(opt => {
          const isSelected = selectedOption === opt.optionLabel;
          let bg = colors.gray100;
          let borderColor = colors.gray200;
          let leftAccent = 'transparent';

          if (!hasSubmitted && isSelected) {
            borderColor = colors.primary;
            bg = colors.primaryBg;
            leftAccent = colors.primary;
          }

          if (hasSubmitted && submitResult.correctOptionLabel === opt.optionLabel) {
            borderColor = colors.success;
            bg = colors.successBg;
            leftAccent = colors.successHover;
          } else if (hasSubmitted && isSelected) {
            borderColor = colors.error;
            bg = colors.errorBg;
            leftAccent = colors.error;
          }

          const labelStyle: React.CSSProperties = {
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: 8,
            background: isSelected && !hasSubmitted ? colors.primary : 'transparent',
            border: `1.5px solid ${isSelected && !hasSubmitted ? colors.primary : colors.gray300}`,
            color: isSelected && !hasSubmitted ? '#fff' : colors.gray600,
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          };

          const optionClasses = [
            'option-card',
            (!hasSubmitted && isSelected) ? 'selected' : '',
            hasSubmitted ? 'submitted' : '',
            (hasSubmitted && !isSelected && submitResult.correctOptionLabel === opt.optionLabel) ? 'correct-bounce' : '',
            (hasSubmitted && isSelected && submitResult.correctOptionLabel !== opt.optionLabel) ? 'wrong-shake' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={opt.optionLabel}
              className={optionClasses}
              onClick={() => { if (!hasSubmitted) onSelectOption(opt.optionLabel); }}
              style={{
                borderRadius: 12, border: '1.5px solid', borderColor,
                background: bg, padding: 0,
                display: 'flex', alignItems: 'stretch', overflow: 'hidden',
              }}
            >
              {leftAccent !== 'transparent' && (
                <div style={{ width: 4, background: leftAccent, flexShrink: 0 }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', flex: 1 }}>
              <span style={labelStyle}>{opt.optionLabel}</span>
              <span style={{ fontSize: 15, color: colors.gray800, flex: 1, lineHeight: 1.5 }}>{opt.optionContent}</span>
              {hasSubmitted && submitResult.correctOptionLabel === opt.optionLabel && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: colors.successHover, fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                  <Check size={13} strokeWidth={3} /> 正确
                </span>
              )}
              {hasSubmitted && isSelected && submitResult.correctOptionLabel !== opt.optionLabel && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: colors.errorHover, fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                  <X size={13} strokeWidth={3} /> 您选的
                </span>
              )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button disabled={!hasPrevQuestion} onClick={() => hasPrevQuestion && onGoToDetail(prevQuestionId)}>上一题</Button>
        <div style={{ textAlign: 'center' }}>
          {!hasSubmitted ? (
            <Button
              type="primary" size="large" onClick={onSubmit}
              disabled={!selectedOption}
              className={selectedOption ? 'submit-glow' : ''}
              style={{ borderRadius: 10, padding: '0 32px', height: 44 }}
            >
              提交答案
            </Button>
          ) : (
            <Button type="primary" size="large" disabled style={{ borderRadius: 10, padding: '0 32px', height: 44 }}>已提交</Button>
          )}
        </div>
        <Button disabled={!hasNextQuestion} onClick={() => hasNextQuestion && onGoToDetail(nextQuestionId)}>
          {hasNextQuestion ? '下一题' : '已到最后一题'}
        </Button>
      </div>

      {submitResult && (
        <div style={{
          marginTop: 24, borderRadius: 12, overflow: 'hidden',
          background: submitResult.isCorrect === 1 ? colors.successBg : colors.errorBg,
          border: `1px solid ${submitResult.isCorrect === 1 ? colors.success : colors.error}`,
          animation: 'slideDown 0.3s ease-out',
        }}>
          <div style={{ padding: 18 }}>
            <div style={{
              fontSize: 15, fontWeight: 700, marginBottom: 8,
              color: submitResult.isCorrect === 1 ? colors.successHover : colors.errorHover,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: '50%',
                background: submitResult.isCorrect === 1 ? colors.success : colors.error,
                color: '#fff',
              }}>
                {submitResult.isCorrect === 1 ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
              </span>
              {submitResult.isCorrect === 1 ? '回答正确！' : '回答错误'}
            </div>
            {submitResult.analysis && (
              <div style={{ color: colors.gray600, fontSize: 14, lineHeight: 1.7 }}>
                <span style={{ fontWeight: 600, color: colors.gray700 }}>解析：</span>{submitResult.analysis}
              </div>
            )}
          </div>
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
        .option-card {
          transition: all 0.18s ease;
          cursor: pointer;
        }
        .option-card:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .option-card.selected {
          transform: scale(1.01);
          box-shadow: 0 2px 12px ${colors.primary}33;
        }
        .option-card.submitted {
          cursor: default;
          transform: scale(1);
        }
        .option-card.submitted:hover {
          transform: scale(1);
          box-shadow: none;
        }
        @keyframes bounceIn {
          0% { transform: scale(1); }
          35% { transform: scale(1.03); }
          65% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        .option-card.correct-bounce {
          animation: bounceIn 0.45s ease-out;
          transform: scale(1);
        }
        .option-card.wrong-shake {
          animation: shake 0.35s ease;
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 ${colors.primary}55; }
          70% { box-shadow: 0 0 0 10px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .submit-glow {
          animation: pulseGlow 1.2s ease-out 1;
        }
      `}</style>
      {submitResult && (
        <div style={{ marginTop: 16 }}>
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
    </div>
  );
};
