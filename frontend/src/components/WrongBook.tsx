import React, { useState } from 'react';
import { Card, Table, Button, Typography, Tag, Empty, Row, Col, Input, Segmented, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UserWrongBookVO, GroupedWrongBookVO } from '../types';
import { defaultSortState, difficultyOptions, getNextSortState, renderDifficultyTag, renderSortableHeader, sortByTitleOrDifficulty } from '../utils/tableHelpers';
import type { SortField, SortState } from '../utils/tableHelpers';

const { Title, Text } = Typography;

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
  const isReviewDue = (record: UserWrongBookVO) => {
    if (!record.nextReviewTime) return true;
    return Date.now() >= new Date(record.nextReviewTime).getTime();
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
        if (val === 4) return <Tag color="success">已掌握</Tag>;
        return <Tag color="warning">阶段 {val}</Tag>;
      }
    },
    {
      title: '下一次推荐温习时间',
      dataIndex: 'nextReviewTime',
      key: 'nextReviewTime',
      render: (val: string) => {
        const due = !val || Date.now() >= new Date(val).getTime();
        return (
          <Space direction="vertical" size={2}>
            <span>{val ? val.replace('T', ' ') : '-'}</span>
            <Tag color={due ? 'success' : 'default'}>{due ? '可温习' : '未到时间'}</Tag>
          </Space>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type="primary" size="small" disabled={!isReviewDue(record)} onClick={() => onGoToDetail(record.questionId, currentQueueIds)}>
          {isReviewDue(record) ? '开始温习' : '未到时间'}
        </Button>
      )
    }
  ];

  if (data.length === 0) {
    return (
      <Card title="我的错题本" extra={<Text type="secondary">这里记录了您所有答错过并处于艾宾浩斯复习周期中的题目。</Text>}>
        <Empty description="暂无错题记录。答错的题目会自动进入错题本复盘。" />
      </Card>
    );
  }

  if (!selectedCategory) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 0 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>错题本复盘</Title>
            <Text type="secondary">按知识分类整理错题，优先复盘薄弱专区。</Text>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {data.map(group => (
            <Col xs={24} sm={12} md={8} lg={6} key={group.category}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  height: '100%'
                }}
                styles={{ body: { padding: 20 } }}
                onClick={() => {
                  setSelectedCategory(group.category);
                  setSearchQuery('');
                  setDifficultyFilter('all');
                  setSortState(defaultSortState);
                }}
              >
                <Title level={4} style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700 }}>
                  {group.category}
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {group.dueCount > 0 ? `今天到期需温习：${group.dueCount} 道` : '暂无待温习到期错题'}
                </Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 16, borderTop: '1px dashed #f0f0f0' }}>
                  <Space>
                    <Tag color="blue" style={{ borderRadius: 4 }}>{group.totalCount} 道错题</Tag>
                    {group.dueCount > 0 && <Tag color="error" style={{ borderRadius: 4 }}>{group.dueCount} 待温习</Tag>}
                  </Space>
                  <Button type="link" style={{ padding: 0 }}>进入复盘</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card
        style={{ borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}
        styles={{ body: { padding: '24px 32px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Title level={3} style={{ margin: '0 0 8px 0', fontWeight: 700 }}>
              {selectedCategory} 错题复盘
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              当前分类共有 {selectedList.length} 道错题，建议按推荐复习时间逐步完成复盘。
            </Text>
          </div>
          <Button size="large" type="default" style={{ borderRadius: 8, height: 44 }} onClick={() => setSelectedCategory(null)}>
            返回错题分类
          </Button>
        </div>
      </Card>

      <Card style={{ borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }} styles={{ body: { padding: '16px 24px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Text type="secondary" style={{ marginRight: 8 }}>难度筛选：</Text>
            <Segmented
              value={difficultyFilter}
              onChange={(val) => setDifficultyFilter(String(val))}
              options={difficultyOptions}
            />
          </div>
          <Input.Search
            placeholder="搜索当前分类错题..."
            allowClear
            style={{ width: 280 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      <Card className="custom-card" styles={{ body: { padding: 0 } }}>
        {sortedList.length === 0 ? (
          <div style={{ padding: 32 }}>
            <Empty description="暂无匹配的错题" />
          </div>
        ) : (
          <Table
            dataSource={sortedList}
            columns={columns}
            rowKey="id"
            pagination={sortedList.length > 8 ? { pageSize: 12 } : false}
            size="large"
          />
        )}
      </Card>
    </div>
  );
};
