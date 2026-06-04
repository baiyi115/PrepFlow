import React from 'react';
import { Button, Space, Tag } from 'antd';
import type { QuestionDetailVO, UserSubmitVO } from '../types';
import { useColors } from '../context/ThemeContext';

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
              width: 20, height: 20, borderRadius: 5,
              background: isCorrect ? colors.success : colors.error,
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              {isCorrect ? '✓' : '✗'}
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

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={prevSubmitId === null} onClick={() => prevSubmitId && onGoToSubmit(prevSubmitId)}>上一条</Button>
        <Button type="dashed" disabled style={{ borderRadius: 10 }}>历史回顾模式</Button>
        <Button disabled={nextSubmitId === null} onClick={() => nextSubmitId && onGoToSubmit(nextSubmitId)}>下一条</Button>
      </div>
    </div>
  );
};
