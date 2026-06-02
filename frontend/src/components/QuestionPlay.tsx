import React, { useEffect } from 'react';
import { Card, Button, Space, Result } from 'antd';
import type { QuestionDetailVO, SubmitAnswerVO } from '../types';

interface Props {
  question: QuestionDetailVO;
  selectedOption: string;
  submitResult: SubmitAnswerVO | null;
  onSelectOption: (optionLabel: string) => void;
  onSubmit: () => void;
  onGoToDetail: (id: string) => void;
  prevQuestionId: string | null;
  nextQuestionId: string | null;
  backText?: string;
  onBack?: () => void;
}

export const QuestionPlay: React.FC<Props> = ({
  question,
  selectedOption,
  onSelectOption,
  submitResult,
  onSubmit,
  onBack,
  prevQuestionId,
  nextQuestionId,
  onGoToDetail,
  backText = '返回列表'
}) => {
  const readOnly = false; // 当前模块不做统一只读封装，由 QuestionReview 控制回顾只读
  const setSelectedOption = onSelectOption;
  // 键盘快捷键支持 (A/B/C/D 和 Enter)
  useEffect(() => {
    // 避免只读、非选择题或者已经提交过结果时触发按键映射
    if (readOnly || question.questionType !== 1 || !!submitResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在输入框中触发
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      
      if (['A', 'B', 'C', 'D'].includes(key)) {
        // 确保题目包含该选项
        const optionExists = question.options?.some(opt => opt.optionLabel === key);
        if (optionExists) {
          setSelectedOption(key);
        }
      }

      if (key === 'ENTER') {
        if (selectedOption) {
          onSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, submitResult, question.options, question.questionType, onSubmit, setSelectedOption, readOnly]);

  const hasSubmitted = !!submitResult;
  const hasPrevQuestion = !!prevQuestionId;
  const hasNextQuestion = !!nextQuestionId;

  const handleOptionClick = (label: string) => {
    if (readOnly || hasSubmitted) return;
    setSelectedOption(label);
  };

  // 防御性交互：非选择题（如主观题、代码题）的友好占位提示
  if (question.questionType !== 1) {
    return (
      <Card 
        style={{ borderLeft: '4px solid #faad14' }} 
        title={question.title} 
        extra={<Button type="default" size="small" onClick={onBack}>{backText}</Button>}
      >
        <Result
          status="warning"
          title="题型暂不支持"
          subTitle="当前系统主要支持选择题刷题。主观题及代码题专区正在加急筹备中，敬请期待！"
          extra={
            <Space>
              <Button disabled={!hasPrevQuestion} onClick={() => hasPrevQuestion && onGoToDetail(prevQuestionId)}>上一题</Button>
              <Button disabled={!hasNextQuestion} onClick={() => hasNextQuestion && onGoToDetail(nextQuestionId)}>下一题</Button>
            </Space>
          }
        />
      </Card>
    );
  }

  return (
    <Card 
      style={{ borderLeft: '4px solid #1677ff' }} 
      title={question.title} 
      extra={<Button type="default" size="small" onClick={onBack}>{backText}</Button>}
    >
      <div style={{ fontSize: 15, marginBottom: 24, whiteSpace: 'pre-wrap' }}>{question.content}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {question.options && question.options.map(opt => {
          const isSelected = selectedOption === opt.optionLabel;
          
          let bgColor = '#f6f8fa';
          let borderColor = '#d0d7de';
          
          if (isSelected) {
            bgColor = '#e6f4ff';
            borderColor = '#1677ff';
          }

          // 提交后的颜色反馈 (或者只读查看历史记录时的颜色反馈)
          if (hasSubmitted) {
            if (submitResult.correctOptionLabel === opt.optionLabel) {
              bgColor = '#f6ffed';
              borderColor = '#52c41a'; // 绿色表示正确答案
            } else if (isSelected && submitResult.correctOptionLabel !== opt.optionLabel) {
              bgColor = '#fff1f0';
              borderColor = '#ff4d4f'; // 红色表示选错的答案
            }
          }

          return (
            <div 
              key={opt.optionLabel} 
              style={{
                padding: '14px 18px',
                background: bgColor,
                border: '1px solid',
                borderColor: borderColor,
                borderRadius: 6,
                cursor: (readOnly || hasSubmitted) ? 'not-allowed' : 'pointer',
                fontWeight: isSelected ? 600 : 'normal',
                opacity: (readOnly || hasSubmitted) && !isSelected && (!hasSubmitted || submitResult.correctOptionLabel !== opt.optionLabel) ? 0.6 : 1,
                transition: 'all 0.3s'
              }}
              onClick={() => handleOptionClick(opt.optionLabel)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{opt.optionLabel}. {opt.optionContent}</span>
                {(!readOnly && !hasSubmitted) && <span style={{ color: '#aaa', fontSize: 12 }}>按 {opt.optionLabel} 选择</span>}
              </div>
            </div>
          );
        })}
      </div>
      <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 24 }}>
        <Button disabled={!hasPrevQuestion} onClick={() => hasPrevQuestion && onGoToDetail(prevQuestionId)}>上一题</Button>
        {readOnly ? (
          <Button type="default" size="large" disabled>历史回顾（不可修改）</Button>
        ) : !hasSubmitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button type="primary" size="large" onClick={onSubmit} disabled={!selectedOption}>
              提交本题答案
            </Button>
            <span style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>支持 Enter 快捷提交</span>
          </div>
        ) : (
          <Button type="primary" size="large" disabled>已提交</Button>
        )}
        <Button disabled={!hasNextQuestion} onClick={() => hasNextQuestion && onGoToDetail(nextQuestionId)}>{hasNextQuestion ? '下一题' : '已到最后一题'}</Button>
      </Space>

      {submitResult && (
        <div style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 8,
          background: submitResult.isCorrect === 1 ? '#f6ffed' : '#fff1f0',
          border: '1px solid',
          borderColor: submitResult.isCorrect === 1 ? '#b7eb8f' : '#ffa39e',
          color: submitResult.isCorrect === 1 ? '#389e0d' : '#cf1322'
        }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
            {submitResult.isCorrect === 1 ? '回答正确！极佳！' : '回答错误。别灰心，继续复盘！'}
          </div>
          <div style={{ margin: '8px 0', fontWeight: 'bold' }}>正确答案：{submitResult.correctOptionLabel}</div>
          <div>解析内容：{submitResult.analysis}</div>
        </div>
      )}
    </Card>
  );
};
