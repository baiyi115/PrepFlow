import React, { useMemo, useState } from 'react';
import { Table, Tag, Button, Typography, Input, Select, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { GroupedWrongBookVO, UserWrongBookVO } from '../types';
import { renderSortableHeader, renderDifficultyTag, sortByTitleOrDifficulty, defaultSortState, getNextSortState } from '../utils/tableHelpers';
import type { SortState, SortField } from '../utils/tableHelpers';
import { useColors, useTheme } from '../context/themeHooks';
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
  const colors = useColors();
  const { theme } = useTheme();
  const categoryColors = theme === 'dark' ? darkCategoryColors : lightCategoryColors;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortState, setSortState] = useState<SortState>(defaultSortState);
  const [nowTime] = useState(() => Date.now());

  const selectedList = useMemo(
    () => data.find(group => group.category === selectedCategory)?.list ?? [],
    [data, selectedCategory],
  );

  const isReviewDue = React.useCallback((record: UserWrongBookVO) => {
    if (!record.nextReviewTime) return true;
    return nowTime >= new Date(record.nextReviewTime).getTime();
  }, [nowTime]);
  const sortedList = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredList = selectedList.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(normalizedQuery);
      const matchesDifficulty = difficultyFilter === 'all' || String(item.difficulty) === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
    return sortByTitleOrDifficulty(filteredList, sortState);
  }, [difficultyFilter, searchQuery, selectedList, sortState]);
  const currentQueueIds = useMemo(() => sortedList.filter(isReviewDue).map(item => item.questionId), [isReviewDue, sortedList]);
  const categorySummaries = useMemo(() => data.map((item, idx) => ({
    ...item,
    total: item.list.length,
    activeCount: item.list.filter(isReviewDue).length,
    palette: categoryColors[idx % categoryColors.length],
  })), [categoryColors, data, isReviewDue]);
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
            text={<span style={{ color: colors.gray500 }}>冷却中 ({record.nextReviewTime ? new Date(record.nextReviewTime).toLocaleDateString() : ''})</span>}
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
      <div className="page-stack">
        <div className="page-header">
          <div>
            <h1 className="page-heading">错题本复习</h1>
            <p className="page-description">按分类归纳答错的题目，优先处理到期复习内容。</p>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="empty-state">
            <BookCheck size={48} color={colors.success} style={{ marginBottom: 16 }} />
            <div className="empty-state-title">暂无错题需要复习</div>
            <Text className="empty-state-text">答题正确率达 100%，或尚未提交任何答题记录。</Text>
          </div>
        ) : (
          <div className="tile-grid">
            {categorySummaries.map(item => {
              const { total, activeCount, palette } = item;
              return (
                <div
                  key={item.category}
                  className="category-tile"
                  onClick={() => handleSelectCategory(item.category)}
                  style={{ background: palette.bg }}
                >
                  <div className="category-tile-title" style={{ color: palette.text }}>{item.category}</div>
                  <div className="category-tile-meta" style={{ color: palette.text }}>
                    共 {total} 题，{activeCount} 题待复习
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Tag color="error">{total} 题</Tag>
                    {activeCount > 0 && <Tag color="success">{activeCount} 待复习</Tag>}
                  </div>
                  <div className="category-tile-action" style={{ color: palette.accent }}>
                    <RotateCcw size={14} /> 前往复习
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
    <div className="page-stack">
      <div className="toolbar-card">
        <div className="filter-group">
          <button onClick={() => setSelectedCategory(null)} className="back-chip">
            <ArrowLeft size={14} /> 返回分类
          </button>
          <h1 className="page-heading" style={{ fontSize: 18 }}>{selectedCategory}</h1>
        </div>
        <div className="filter-group">
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

      <div className="table-surface">
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
