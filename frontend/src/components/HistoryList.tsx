import React, { useState } from 'react';
import { Card, Table, Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { QuestionVO, UserSubmitVO } from '../types';

interface Props {
  data: UserSubmitVO[];
  questionList: QuestionVO[];
  onReview: (record: UserSubmitVO, submitIds: string[]) => void;
}

export const HistoryList: React.FC<Props> = ({ data, questionList, onReview }) => {
  const [pageSize, setPageSize] = useState(10);
  const submitIds = data.map(item => item.submitId);
  const questionTitleMap = new Map(questionList.map(item => [item.id, item.title]));

  const columns: ColumnsType<UserSubmitVO> = [
    { 
      title: '题目', 
      dataIndex: 'questionId', 
      key: 'questionId',
      render: (_, record) => {
        const title = record.questionTitle || questionTitleMap.get(record.questionId) || `题目 ${record.questionId}`;
        return (
          <Button type="link" style={{ padding: 0, fontWeight: 600 }} onClick={() => onReview(record, submitIds)}>
            {title}
          </Button>
        );
      }
    },
    { title: '我的选择', dataIndex: 'selectedOptionLabel', key: 'selectedOptionLabel' },
    { title: '正确选项', dataIndex: 'correctOptionLabel', key: 'correctOptionLabel' },
    { 
      title: '结果', 
      dataIndex: 'isCorrect', 
      key: 'isCorrect',
      render: (val: number) => val === 1 ? <Tag color="success">正确</Tag> : <Tag color="error">错误</Tag>
    },
    { title: '得分', dataIndex: 'score', key: 'score', render: (val: string) => <strong>{val}</strong> },
    { title: '时间', dataIndex: 'createTime', key: 'createTime', render: (val: string) => val.replace('T', ' ') }
  ];

  return (
    <div className="page-container">
      <Card className="custom-card" title="答题历史" styles={{ body: { padding: 0 } }}>
        <Table 
          dataSource={data} 
          columns={columns} 
          rowKey="submitId" 
          pagination={{ 
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30', '50'],
            onChange: (_, size) => setPageSize(size)
          }} 
          scroll={{ y: 480 }}
          size="large"
        />
      </Card>
    </div>
  );
};
