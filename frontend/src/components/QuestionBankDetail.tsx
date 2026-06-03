import React, { useState } from 'react';
import { Card, Table, Button, Tag, Typography, Input, Segmented, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { QuestionVO } from '../types';
import { defaultSortState, difficultyOptions, getNextSortState, renderDifficultyTag, renderSortableHeader, sortByTitleOrDifficulty } from '../utils/tableHelpers';
import type { SortField, SortState } from '../utils/tableHelpers';

const { Title, Text } = Typography;

interface Props {
  category: string;
  questionList: QuestionVO[];
  onGoToDetail: (id: string) => void;
  onStartPracticeCategory: (category: string, sortedQuestionIds: string[]) => void;
  onBack: () => void;
}

export const QuestionBankDetail: React.FC<Props> = ({
  category,
  questionList,
  onGoToDetail,
  onStartPracticeCategory,
  onBack
}) => {
  const [sortState, setSortState] = useState<SortState>(defaultSortState);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [pageSize, setPageSize] = useState<number>(10);

  // 1. 过滤分类、搜索文本、难度类型
  const filteredList = questionList.filter(q => {
    const isCategory = (q.category || '其它未分类') === category;
    const matchesSearch = q.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' ? true : String(q.difficulty) === difficultyFilter;
    return isCategory && matchesSearch && matchesDifficulty;
  });

  const toggleSort = (field: SortField) => setSortState(prev => getNextSortState(prev, field));
  const sortedList = sortByTitleOrDifficulty(filteredList, sortState);

  const getColumns = (): ColumnsType<QuestionVO> => {
    return [
      { 
        title: renderSortableHeader('题目名称', 'title', sortState, toggleSort), 
        dataIndex: 'title', 
        key: 'title',
        render: (text: string, record: QuestionVO) => (
          <Button type="link" style={{ padding: 0, fontWeight: 'bold', fontSize: 14 }} onClick={() => onGoToDetail(record.id)}>
            {text}
          </Button>
        )
      },
      { 
        title: renderSortableHeader('难度', 'difficulty', sortState, toggleSort),
        dataIndex: 'difficulty', 
        key: 'difficulty',
        width: 140,
        render: renderDifficultyTag
      },
      { 
        title: '所属标签', 
        dataIndex: 'category', 
        key: 'category',
        width: 180,
        render: (cat: string) => (
          <Tag color="blue" style={{ borderRadius: 4 }}>{cat}</Tag>
        )
      }
    ];
  };

  return (
    <div className="page-container">
      <Card className="custom-card" style={{ marginBottom: 24 }} styles={{ body: { padding: '16px 24px' } }}>
        <div className="flex-between-wrap">
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            {category} 面试专题
          </Title>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Button 
              type="primary" 
              onClick={() => onStartPracticeCategory(category, sortedList.map(q => q.id))}
              disabled={sortedList.length === 0}
            >
              开始刷题
            </Button>
            <Button onClick={onBack}>返回大厅</Button>
          </div>
        </div>
      </Card>

      <Card className="custom-card" style={{ marginBottom: 24 }} styles={{ body: { padding: '16px 24px' } }}>
        <div className="flex-between-wrap">
          <div>
            <Text type="secondary" style={{ marginRight: 8 }}>难度：</Text>
            <Segmented
              value={difficultyFilter}
              onChange={(val) => setDifficultyFilter(String(val))}
              options={difficultyOptions}
            />
          </div>
            
          <Input.Search
            placeholder="搜索题目..."
            allowClear
            style={{ width: 240 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      <Card className="custom-card" styles={{ body: { padding: 0 } }}>
        {sortedList.length === 0 ? (
          <div style={{ padding: 32 }}>
            <Empty description="暂无匹配的题目" />
          </div>
        ) : (
          <Table 
            dataSource={sortedList} 
            columns={getColumns()} 
            rowKey="id" 
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30', '50'],
              onChange: (_, size) => setPageSize(size)
            }} 
            scroll={{ y: 480 }}
            size="large"
          />
        )}
      </Card>
    </div>
  );
};
