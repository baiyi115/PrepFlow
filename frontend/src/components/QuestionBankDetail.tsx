import React, { useState } from 'react';
import { Table, Button, Tag, Typography, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { QuestionVO } from '../types';
import { defaultSortState, difficultyOptions, getNextSortState, renderDifficultyTag, renderSortableHeader, sortByTitleOrDifficulty } from '../utils/tableHelpers';
import type { SortField, SortState } from '../utils/tableHelpers';
import { useColors } from '../context/ThemeContext';
import { SearchX, ArrowLeft, Play } from 'lucide-react';

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
  const colors = useColors();
  const [sortState, setSortState] = useState<SortState>(defaultSortState);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
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
      { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
      { title: renderSortableHeader('题目名称', 'title', sortState, toggleSort),
        dataIndex: 'title',
        key: 'title',
        render: (text: string, record: QuestionVO) => (
          <Button type="link" style={{ padding: 0, fontWeight: 600, fontSize: 14, color: colors.primary }} onClick={() => onGoToDetail(record.id)}>
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
    <div>
      <div style={{
        background: `linear-gradient(135deg, ${colors.primaryBg}, ${colors.gray100})`,
        borderRadius: 16, padding: '28px 32px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <button onClick={onBack} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                borderRadius: 8, border: `1px solid ${colors.gray600}`, cursor: 'pointer',
                background: 'transparent', color: colors.gray600, fontSize: 12,
              }}>
                <ArrowLeft size={14} /> 返回
              </button>
            </div>
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: colors.gray900 }}>
              {category} 面试专题
            </Title>
            <Text style={{ color: colors.gray600, fontSize: 13, marginTop: 4, display: 'block' }}>
              {sortedList.length} 道题目
            </Text>
          </div>
          <Button
            type="primary"
            icon={<Play size={14} />}
            size="large"
            onClick={() => onStartPracticeCategory(category, sortedList.map(q => q.id))}
            disabled={sortedList.length === 0}
            style={{ borderRadius: 10, padding: '0 24px', height: 42 }}
          >
            开始刷题
          </Button>
        </div>
      </div>

      <div style={{
        background: colors.gray100, borderRadius: 12, padding: '14px 20px',
        marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: colors.gray500, fontSize: 13, marginRight: 2 }}>难度：</Text>
          {difficultyOptions.map(opt => {
            const v = String(opt.value ?? 'all');
            const active = difficultyFilter === v;
            return (
              <button
                key={v}
                onClick={() => setDifficultyFilter(v)}
                style={{
                  padding: '4px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  background: active ? colors.primary : 'transparent',
                  color: active ? '#fff' : colors.gray600,
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <Input.Search
          placeholder="搜索题目..."
          allowClear
          style={{ width: 240, borderColor: colors.gray400 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {sortedList.length === 0 ? (
        <div style={{ padding: 64, textAlign: 'center', background: colors.gray100, borderRadius: 12 }}>
          <SearchX size={44} color={colors.gray400} style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.gray700, marginBottom: 6 }}>暂无匹配的题目</div>
          <Text style={{ color: colors.gray500 }}>调整搜索条件或筛选难度，试试其他关键词</Text>
        </div>
      ) : (
        <div style={{ background: colors.gray100, borderRadius: 12, overflow: 'hidden' }}>
          <Table
            dataSource={sortedList}
            columns={getColumns()}
            rowKey="id"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            size="large"
          />
        </div>
      )}
    </div>
  );
};
