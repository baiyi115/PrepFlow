import React, { useState } from 'react';
import { Table, Tag, Button, Typography, Input, Select, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { GroupedWrongBookVO, UserWrongBookVO } from '../types';
import { renderSortableHeader, renderDifficultyTag, sortByTitleOrDifficulty, defaultSortState, getNextSortState } from '../utils/tableHelpers';
import type { SortState, SortField } from '../utils/tableHelpers';
import { useColors, useTheme } from '../context/ThemeContext';
import { BookCheck, ArrowLeft, RotateCcw } from 'lucide-react';

const { Text } = Typography;

interface Props {
  data: GroupedWrongBookVO[];
  initialCategory?: string | null;
  onGoToDetail: (id: string, queueIds?: string[]) => void;
}

const lightCategoryColors = [
  { bg: '#fef3c7', text: '#92400e', accent: '#d97706' },
  { bg: '#ffedd5', text: '#9a3412', accent: '#ea580c' },
  { bg: '#fce7f3', text: '#9d174d', accent: '#db2777' },
  { bg: '#e0e7ff', text: '#3730a3', accent: '#6366f1' },
  { bg: '#d1fae5', text: '#065f46', accent: '#059669' },
  { bg: '#fef9c3', text: '#854d0e', accent: '#ca8a04' },
  { bg: '#ede9fe', text: '#5b21b6', accent: '#8b5cf6' },
  { bg: '#fff1f2', text: '#9f1239', accent: '#e11d48' },
];

const darkCategoryColors = [
  { bg: '#2b1d0e', text: '#fbbf24', accent: '#d97706' },
  { bg: '#2b1408', text: '#fdba74', accent: '#ea580c' },
  { bg: '#2b0d1a', text: '#f9a8d4', accent: '#db2777' },
  { bg: '#1e1a3b', text: '#a5b4fc', accent: '#6366f1' },
  { bg: '#052e16', text: '#6ee7b7', accent: '#059669' },
  { bg: '#2b2608', text: '#fde047', accent: '#ca8a04' },
  { bg: '#1e1030', text: '#c4b5fd', accent: '#8b5cf6' },
  { bg: '#2b0f14', text: '#fda4af', accent: '#e11d48' },
];

export const WrongBook: React.FC<Props> = ({ data, initialCategory = null, onGoToDetail }) => {
  const colors = useColors(); const { theme } = useTheme();
  const categoryColors = theme === 'dark' ? darkCategoryColors : lightCategoryColors;
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
        <Button type="link" disabled={!isReviewDue(record)} style={{ padding: 0, fontWeight: 600, color: colors.primary }} onClick={() => onGoToDetail(record.questionId, currentQueueIds)}>
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
            text={<span style={{ color: colors.gray500 }}>CD中 ({record.nextReviewTime ? new Date(record.nextReviewTime).toLocaleDateString() : ''})</span>}
          />
        );
      }
    }
  ];

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setDifficultyFilter('all');
    setSortState(defaultSortState);
  };

  if (!selectedCategory) {
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.gray900, margin: '0 0 8px 0' }}>错题本复盘</h2>
        <p style={{ color: colors.gray500, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          按分类归纳回答错误的题目。基于艾宾浩斯记忆遗忘曲线，制定了复盘冷却机制。
        </p>

        {data.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', background: colors.gray100, borderRadius: 12 }}>
            <BookCheck size={48} color={colors.success} style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.gray800, marginBottom: 8 }}>暂无错题需要复盘</div>
            <Text style={{ color: colors.gray500 }}>答题正确率达 100%，或尚未提交任何答题记录</Text>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {data.map((item, idx) => {
              const total = item.list.length;
              const activeCount = item.list.filter(isReviewDue).length;
              const p = categoryColors[idx % categoryColors.length];
              return (
                <div
                  key={item.category}
                  onClick={() => handleSelectCategory(item.category)}
                  style={{
                    borderRadius: 16, background: p.bg, padding: 24,
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: p.text, marginBottom: 4 }}>
                      {item.category}
                    </div>
                    <div style={{ fontSize: 13, color: p.text, opacity: 0.7, marginBottom: 12 }}>
                      共 {total} 题，{activeCount} 题待复习
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Tag color="error" style={{ borderRadius: 6 }}>{total} 题</Tag>
                      {activeCount > 0 && <Tag color="success" style={{ borderRadius: 6 }}>{activeCount} 待复习</Tag>}
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4, color: p.accent, fontSize: 13, fontWeight: 600 }}>
                      <RotateCcw size={14} /> 前往复习
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        flexWrap: 'wrap', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSelectedCategory(null)} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px',
            borderRadius: 8, border: `1px solid ${colors.gray200}`, cursor: 'pointer',
            background: colors.gray100, color: colors.gray600, fontSize: 13,
          }}>
            <ArrowLeft size={14} /> 返回分类
          </button>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.gray900, margin: 0 }}>
            {selectedCategory}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="搜索错题名称"
            allowClear
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: 200 }}
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
        </div>
      </div>

      <div style={{ background: colors.gray100, borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={sortedList}
          rowKey="questionId"
          pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          locale={{ emptyText: '暂无匹配的错题' }}
          size="large"
        />
      </div>
    </div>
  );
};
