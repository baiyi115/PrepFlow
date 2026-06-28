import React, { useMemo, useState } from 'react';
import type { QuestionVO } from '../types';
import { useTheme } from '../context/themeHooks';
import { SearchX, ArrowRight, Search } from 'lucide-react';

interface Props {
  questionList: QuestionVO[];
  onSelectCategory: (category: string) => void;
}

const lightTilePalette = [
  { bg: '#fef3c7', text: '#92400e', accent: '#d97706' },
  { bg: '#ffedd5', text: '#9a3412', accent: '#ea580c' },
  { bg: '#fce7f3', text: '#9d174d', accent: '#db2777' },
  { bg: '#e0e7ff', text: '#3730a3', accent: '#6366f1' },
  { bg: '#d1fae5', text: '#065f46', accent: '#059669' },
  { bg: '#fef9c3', text: '#854d0e', accent: '#ca8a04' },
  { bg: '#ede9fe', text: '#5b21b6', accent: '#8b5cf6' },
  { bg: '#fff1f2', text: '#9f1239', accent: '#e11d48' },
];

const darkTilePalette = [
  { bg: '#2b1d0e', text: '#fbbf24', accent: '#d97706' },
  { bg: '#2b1408', text: '#fdba74', accent: '#ea580c' },
  { bg: '#2b0d1a', text: '#f9a8d4', accent: '#db2777' },
  { bg: '#1e1a3b', text: '#a5b4fc', accent: '#6366f1' },
  { bg: '#052e16', text: '#6ee7b7', accent: '#059669' },
  { bg: '#2b2608', text: '#fde047', accent: '#ca8a04' },
  { bg: '#1e1030', text: '#c4b5fd', accent: '#8b5cf6' },
  { bg: '#2b0f14', text: '#fda4af', accent: '#e11d48' },
];

export const QuestionBankList: React.FC<Props> = ({ questionList, onSelectCategory }) => {
  const { theme } = useTheme();
  const tilePalette = theme === 'dark' ? darkTilePalette : lightTilePalette;
  const [searchQuery, setSearchQuery] = useState('');

  const categoryCounts = useMemo(() => questionList.reduce((acc, q) => {
    const cat = q.category || '其它';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [questionList]);

  const displayCategories = useMemo(() => Object.keys(categoryCounts).filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  ), [categoryCounts, searchQuery]);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1 className="page-heading">开始刷题</h1>
          <p className="page-description">选择面试方向，按分类逐题攻破。</p>
        </div>
        <div className="search-box">
          <Search size={15} className="search-box-icon" />
          <input
            className="search-input"
            placeholder="搜索题库..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {displayCategories.length === 0 ? (
        <div className="empty-state">
          <SearchX size={40} style={{ marginBottom: 16, opacity: 0.48 }} />
          <div className="empty-state-title">暂无匹配的题库分类</div>
          <div className="empty-state-text">尝试修改搜索关键词，或浏览全部题库。</div>
        </div>
      ) : (
        <div className="tile-grid">
          {displayCategories.map((cat, idx) => {
            const palette = tilePalette[idx % tilePalette.length];
            const count = categoryCounts[cat];
            return (
              <div
                key={cat}
                className="category-tile"
                onClick={() => onSelectCategory(cat)}
                style={{ background: palette.bg }}
              >
                <div className="category-tile-title" style={{ color: palette.text }}>{cat}</div>
                <div className="category-tile-meta" style={{ color: palette.text }}>{count} 道题</div>
                <div className="category-tile-action" style={{ color: palette.accent }}>
                  开始刷题<ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
