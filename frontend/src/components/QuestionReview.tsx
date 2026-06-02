import React from 'react';
import { Card, Button, Space, Tag, Divider, Alert } from 'antd';
import type { QuestionDetailVO, UserSubmitVO } from '../types';

interface Props {
  question: QuestionDetailVO;
  record: UserSubmitVO | null;
  onBack: () => void;
  prevSubmitId: string | null;
  nextSubmitId: string | null;
  onGoToSubmit: (submitId: string) => void;
}

export const QuestionReview: React.FC<Props> = ({
  question,
  record,
  onBack,
  prevSubmitId,
  nextSubmitId,
  onGoToSubmit
}) => {
  const selectedOption = record?.selectedOptionLabel || '';
  const correctOption = record?.correctOptionLabel || '';
  const isCorrect = record?.isCorrect === 1;
  const score = record?.score || '0';
  const createTime = record?.createTime || '';

  return (
    <Card 
      style={{ borderLeft: '4px solid #8c8c8c' }} 
      title={
        <Space size="middle">
          <span>回顾历史题目</span>
          <Tag color="default">只读回顾</Tag>
          {record && (
            <Tag color={isCorrect ? 'success' : 'error'}>
              {isCorrect ? '当时回答正确' : '当时回答错误'}
            </Tag>
          )}
        </Space>
      }
      extra={<Button type="default" size="small" onClick={onBack}>返回历史记录</Button>}
    >
      {/* 题目内容 */}
      <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>{question.title}</div>
      <div style={{ fontSize: 15, marginBottom: 24, whiteSpace: 'pre-wrap', color: '#595959' }}>{question.content}</div>
      
      {/* 选项组展示 - 仅静态呈现 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {question.options && question.options.map(opt => {
          const isUserSelected = selectedOption === opt.optionLabel;
          const isCorrectAnswer = correctOption === opt.optionLabel;
          
          let bgColor = '#f8fafc';
          let borderColor = '#e2e8f0';
          const borderStyle = 'solid';

          if (isCorrectAnswer) {
            bgColor = '#f6ffed';
            borderColor = '#52c41a';
          } else if (isUserSelected && !isCorrect) {
            bgColor = '#fff1f0';
            borderColor = '#ff4d4f';
          }

          return (
            <div 
              key={opt.optionLabel} 
              style={{
                padding: '14px 18px',
                background: bgColor,
                border: `1px ${borderStyle}`,
                borderColor: borderColor,
                borderRadius: 8,
                cursor: 'not-allowed',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{opt.optionLabel}. {opt.optionContent}</span>
              <Space>
                {isCorrectAnswer && <Tag color="success">正确答案</Tag>}
                {isUserSelected && <Tag color={isCorrect ? 'success' : 'error'}>您的选择</Tag>}
              </Space>
            </div>
          );
        })}
      </div>

      {/* 答题报告卡片 */}
      {record && (
        <Alert
          message={<strong>答题历史报告</strong>}
          description={
            <div style={{ marginTop: 8 }}>
              答题时间：{createTime.replace('T', ' ')} &nbsp;|&nbsp; 
              得分：<strong style={{ color: isCorrect ? '#52c41a' : '#ff4d4f' }}>{score} 分</strong> &nbsp;|&nbsp; 
              判题结果：{isCorrect ? <span style={{ color: '#52c41a', fontWeight: 'bold' }}>正确</span> : <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>错误</span>}
            </div>
          }
          type={isCorrect ? 'success' : 'error'}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Divider style={{ margin: '24px 0' }} />

      {/* 解析部分 */}
      {record && record.analysis && (
        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: 15, marginBottom: 8 }}>题目深度解析</div>
          <div style={{ color: '#475569', lineHeight: '22px' }}>{record.analysis}</div>
        </div>
      )}

      {/* 上下文导航控制 */}
      <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Button disabled={prevSubmitId === null} onClick={() => onGoToSubmit(prevSubmitId!)}>上一条</Button>
        <Button size="large" type="dashed" disabled>历史回顾模式</Button>
        <Button disabled={nextSubmitId === null} onClick={() => onGoToSubmit(nextSubmitId!)}>下一条</Button>
      </Space>
    </Card>
  );
};
