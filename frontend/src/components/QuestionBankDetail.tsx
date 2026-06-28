import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Typography, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { QuestionVO } from '../types';
import { defaultSortState, difficultyOptions, getNextSortState, renderDifficultyTag, renderSortableHeader, sortByTitleOrDifficulty } from '../utils/tableHelpers';
import type { SortField, SortState } from '../utils/tableHelpers';
import { useColors } from '../context/themeHooks';
import { SearchX, ArrowLeft, Play } from 'lucide-react';

const { Text } = Typography;

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
  const colors = useColors();
  const [sortState, setSortState] = useState<SortState>(defaultSortState);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const filteredList = questionList.filter(q => {
    const isCategory = (q.category || '其它未分类') === category;
    const matchesSearch = q.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' ? true : String(q.difficulty) === difficultyFilter;
    return isCategory && matchesSearch && matchesDifficulty;
  });

  const toggleSort = (field: SortField) => setSortState(prev => getNextSortState(prev, field));
  const sortedList = useMemo(() => sortByTitleOrDifficulty(filteredList, sortState), [filteredList, sortState]);
  const sortedQuestionIds = useMemo(() => sortedList.map(q => q.id), [sortedList]);

  const columns: ColumnsType<QuestionVO> = [
    { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    {
      title: renderSortableHeader('题目名称', 'title', sortState, toggleSort),
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: QuestionVO) => (
        <Button type="link" style={{ padding: 0, fontWeight: 600, color: colors.primary }} onClick={() => onGoToDetail(record.id)}>
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
      render: (cat: string) => <Tag color="blue">{cat}</Tag>
    }
  ];

  return (
    <div className="page-stack">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div>
            <button onClick={onBack} className="back-chip" style={{ marginBottom: 10 }}>
              <ArrowLeft size={14} /> 返回
            </button>
            <h1 className="page-hero-title">{category} 面试专题</h1>
            <span className="page-hero-meta">{sortedList.length} 道题目</span>
          </div>
          <Button
            type="primary"
            icon={<Play size={14} />}
            size="large"
            onClick={() => onStartPracticeCategory(category, sortedQuestionIds)}
            disabled={sortedList.length === 0}
          >
            开始刷题
          </Button>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="filter-group">
          <Text className="filter-label">难度筛选</Text>
          {difficultyOptions.map(opt => {
            const value = String(opt.value ?? 'all');
            const active = difficultyFilter === value;
            return (
              <button
                key={value}
                onClick={() => setDifficultyFilter(value)}
                className={`segmented-button${active ? ' is-active' : ''}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <Input.Search
          placeholder="搜索题目..."
          allowClear
          style={{ width: 240 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {sortedList.length === 0 ? (
        <div className="empty-state">
          <SearchX size={44} style={{ marginBottom: 16, opacity: 0.48 }} />
          <div className="empty-state-title">暂无匹配的题目</div>
          <div className="empty-state-text">调整搜索条件或筛选难度，试试其他关键词。</div>
        </div>
      ) : (
        <div className="table-surface">
          <Table
            dataSource={sortedList}
            columns={columns}
            rowKey="id"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            size="large"
          />
        </div>
      )}
    </div>
  );
};
