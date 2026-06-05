import React from 'react';
import { Table, Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { QuestionVO, UserSubmitVO } from '../types';
import { useColors } from '../context/ThemeContext';

interface Props {
  data: UserSubmitVO[];
  questionList: QuestionVO[];
  onReview: (record: UserSubmitVO, submitIds: string[]) => void;
}

export const HistoryList: React.FC<Props> = ({ data, questionList, onReview }) => {
  const colors = useColors();
  const submitIds = data.map(item => item.submitId);
  const questionTitleMap = new Map(questionList.map(item => [item.id, item.title]));

  const columns: ColumnsType<UserSubmitVO> = [
    {
      title: '题目',
      dataIndex: 'questionId',
      key: 'questionId',
      onCell: () => ({ style: { wordBreak: 'break-word' as const } }),
      render: (_, record) => {
        const title = record.questionTitle || questionTitleMap.get(record.questionId) || `题目 ${record.questionId}`;
        return (
          <Button type="link" style={{ padding: 0, fontWeight: 600, color: colors.primary, whiteSpace: 'normal', textAlign: 'left' }} onClick={() => onReview(record, submitIds)}>
            {title}
          </Button>
        );
      }
    },
    { title: '我的选择', dataIndex: 'selectedOptionLabel', key: 'selectedOptionLabel', width: 100 },
    { title: '正确选项', dataIndex: 'correctOptionLabel', key: 'correctOptionLabel', width: 100 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 140, render: (val: string) => val || '-' },
    {
      title: '结果',
      dataIndex: 'isCorrect',
      key: 'isCorrect',
      width: 80,
      filters: [
        { text: '正确', value: 1 },
        { text: '错误', value: 0 },
      ],
      onFilter: (value, record) => record.isCorrect === value,
      render: (val: number) => val === 1 ? <Tag color="success">正确</Tag> : <Tag color="error">错误</Tag>
    },
    { title: '得分', dataIndex: 'score', key: 'score', width: 80, render: (val: string) => <strong>{val}</strong> },
    { title: '时间', dataIndex: 'createTime', key: 'createTime', width: 170, render: (val: string) => val.replace('T', ' ') }
  ];

  return (
    <div>
      <style>{`
        .history-table table {
          table-layout: fixed;
        }
      `}</style>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.gray900, margin: '0 0 20px 0' }}>答题历史</h2>
      {data.length === 0 ? (
        <div style={{ padding: 80, textAlign: 'center', background: colors.gray100, borderRadius: 12 }}>
          <div style={{ fontSize: 15, color: colors.gray500 }}>暂无答题记录</div>
        </div>
      ) : (
        <div className="history-table" style={{ background: colors.gray100, borderRadius: 12, overflow: 'hidden' }}>
          <Table
            dataSource={data}
            columns={columns}
            rowKey="submitId"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            size="large"
          />
        </div>
      )}
    </div>
  );
};
