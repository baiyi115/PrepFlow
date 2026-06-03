import React, { useState } from 'react';
import { Table, Tag, Button, Typography, Space, Input, Select, Badge, Card, Result } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { GroupedWrongBookVO, UserWrongBookVO } from '../types';
import { renderSortableHeader, renderDifficultyTag, sortByTitleOrDifficulty, defaultSortState, getNextSortState } from '../utils/tableHelpers';
import type { SortState, SortField } from '../utils/tableHelpers';

const { Title, Paragraph, Text } = Typography;

interface Props {
  data: GroupedWrongBookVO[];
  initialCategory?: string | null;
  onGoToDetail: (id: string, queueIds?: string[]) => void;
}

export const WrongBook: React.FC<Props> = ({ data, initialCategory = null, onGoToDetail }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortState, setSortState] = useState<SortState>(defaultSortState);

  const selectedGroup = data.find(g => g.category === selectedCategory);
  const selectedList = selectedGroup ? selectedGroup.list : [];

  const filteredList = selectedList.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' ? true : String(item.difficulty) === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const sortedList = sortByTitleOrDifficulty(filteredList, sortState);
  
  // 使用当前时间戳状态，避免在渲染期直接调用 Date.now()，同时保持纯净性
  const [nowTime] = useState(() => Date.now());

  const isReviewDue = (record: UserWrongBookVO) => {
    if (!record.nextReviewTime) return true;
    return nowTime >= new Date(record.nextReviewTime).getTime();
  };
  const currentQueueIds = sortedList.filter(isReviewDue).map(item => item.questionId);
  const toggleSort = (field: SortField) => setSortState(prev => getNextSortState(prev, field));

  const columns: ColumnsType<UserWrongBookVO> = [
    {
      title: renderSortableHeader('题目名称', 'title', sortState, toggleSort),
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: UserWrongBookVO) => (
        <Button type="link" disabled={!isReviewDue(record)} style={{ padding: 0, fontWeight: 'bold' }} onClick={() => onGoToDetail(record.questionId, currentQueueIds)}>
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
      title: '复习阶段',
      dataIndex: 'reviewStage',
      key: 'reviewStage',
      width: 120,
      render: (val: number) => {
        const text = `阶段 ${val}`;
        if (val >= 4) return <Tag color="success">{text} (已掌握)</Tag>;
        if (val === 0) return <Tag color="default">初始错题</Tag>;
        return <Tag color="processing">{text}</Tag>;
      }
    },
    {
      title: '状态',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const due = isReviewDue(record);
        if (due) return <Badge status="error" text="可复习" />;
        return (
          <Badge 
            status="default" 
            text={<span style={{ color: '#8c8c8c' }}>CD中 ({record.nextReviewTime ? new Date(record.nextReviewTime).toLocaleDateString() : ''})</span>} 
          />
        );
      }
    }
  ];

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    // 重置搜索、难度和排序过滤条件，避免过滤条件残留
    setSearchQuery('');
    setDifficultyFilter('all');
    setSortState(defaultSortState);
  };

  if (!selectedCategory) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Card className="custom-card">
          <div style={{ padding: '8px 12px' }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>错题本复盘专区</Title>
            <Paragraph style={{ color: '#64748b', fontSize: 14, marginBottom: 0 }}>
              按分类归纳您回答错误的题目。这里基于艾宾浩斯记忆遗忘曲线，为您制定了复盘冷却机制：每次重新挑战正确后，错题将晋级到下一阶段并进入对应的冷却状态；
              如果回答错误，复习阶段将重置回初始错题。只有当冷却时间结束（状态显示为“可复习”）时，才能重新点击挑战！
            </Paragraph>
          </div>
        </Card>
        
        {data.length === 0 ? (
          <Card className="custom-card">
            <Result
              status="success"
              title="恭喜，暂无错题需要复盘"
              subTitle="您的答题正确率为 100%，或尚未提交任何错题！继续保持哦！"
            />
          </Card>
        ) : (
          <div className="card-grid">
            {data.map(item => {
              const total = item.list.length;
              const activeList = item.list.filter(isReviewDue);
              const activeCount = activeList.length;

              return (
                <Card 
                  key={item.category} 
                  hoverable 
                  className="custom-card"
                  onClick={() => handleSelectCategory(item.category)}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 110 }}>
                    <div>
                      <Title level={5} style={{ margin: '0 0 8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.category}</span>
                        <Tag color="error">{total} 题</Tag>
                      </Title>
                      <Paragraph style={{ color: '#64748b', fontSize: 13, marginBottom: 0 }}>
                        待复习的题目：<Text type="danger" strong>{activeCount}</Text> 题 / 共 {total} 题
                      </Paragraph>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <Button type="primary" size="small" disabled={activeCount === 0}>
                        {activeCount > 0 ? '前往复习' : '冷却中'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="custom-card">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space>
            <Button onClick={() => setSelectedCategory(null)}>返回分类</Button>
            <Title level={5} style={{ margin: 0 }}>错题分类：{selectedCategory}</Title>
          </Space>
          <Space wrap>
            <Input.Search 
              placeholder="搜索错题名称" 
              allowClear 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: 220 }} 
            />
            <Select 
              value={difficultyFilter} 
              onChange={setDifficultyFilter} 
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部难度' },
                { value: '1', label: '简单' },
                { value: '2', label: '中等' },
                { value: '3', label: '困难' }
              ]}
            />
          </Space>
        </div>

        <Table 
          columns={columns} 
          dataSource={sortedList} 
          rowKey="questionId" 
          bordered
          pagination={{ 
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30', '50']
          }}
          locale={{ emptyText: '暂无匹配的错题' }}
        />
      </Space>
    </Card>
  );
};
