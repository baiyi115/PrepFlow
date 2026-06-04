import React, { useEffect } from 'react';
import { Button } from 'antd';
import type { QuestionDetailVO, SubmitAnswerVO } from '../types';
import { useColors } from '../context/ThemeContext';

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
    <div style={{ maxWidth: 760, margin: '0 auto', paddingTop: 32 }}>
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

          return (
            <div
              key={opt.optionLabel}
              onClick={() => { if (!hasSubmitted) onSelectOption(opt.optionLabel); }}
              style={{
                borderRadius: 12, cursor: hasSubmitted ? 'default' : 'pointer',
                border: '1.5px solid', borderColor,
                background: bg, padding: 0,
                transition: 'all 0.18s ease',
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
                <span style={{ color: colors.successHover, fontWeight: 600, fontSize: 13, flexShrink: 0 }}>✓ 正确</span>
              )}
              {hasSubmitted && isSelected && submitResult.correctOptionLabel !== opt.optionLabel && (
                <span style={{ color: colors.errorHover, fontWeight: 600, fontSize: 13, flexShrink: 0 }}>✗ 您选的</span>
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
            <Button type="primary" size="large" onClick={onSubmit} disabled={!selectedOption} style={{ borderRadius: 10, padding: '0 32px', height: 44 }}>
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
                width: 24, height: 24, borderRadius: 6,
                background: submitResult.isCorrect === 1 ? colors.success : colors.error,
                fontSize: 13, color: '#fff',
              }}>
                {submitResult.isCorrect === 1 ? '✓' : '✗'}
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
    </div>
  );
};
