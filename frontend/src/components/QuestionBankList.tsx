import React, { useState } from 'react';
import type { QuestionVO } from '../types';
import { useColors, useTheme } from '../context/ThemeContext';
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
  const colors = useColors(); const { theme } = useTheme();
  const tilePalette = theme === 'dark' ? darkTilePalette : lightTilePalette;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryCounts = questionList.reduce((acc, q) => {
    const cat = q.category || '其它';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allCategories = Object.keys(categoryCounts);
  const displayCategories = allCategories.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: colors.gray900, letterSpacing: '-0.02em' }}>
          开始刷题
        </h1>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 15, color: colors.gray500 }}>
            选择面试方向，逐题攻破
          </span>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', marginTop: -7.5, color: colors.gray400, pointerEvents: 'none' }} />
            <input
              placeholder="搜索题库..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', height: 36, padding: '0 12px 0 34px', borderRadius: 8,
                border: `1px solid ${colors.gray300}`, outline: 'none', fontSize: 14,
                background: colors.gray100, color: colors.gray800,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = colors.primary; }}
              onBlur={e => { e.target.style.borderColor = colors.gray300; }}
            />
          </div>
        </div>
      </div>

      {displayCategories.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', borderRadius: 16,
          background: colors.gray100,
        }}>
          <SearchX size={40} color={colors.gray400} style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.gray700, marginBottom: 8 }}>暂无匹配的题库分类</div>
          <span style={{ color: colors.gray500 }}>试试修改搜索关键词，或浏览全部题库</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {displayCategories.map((cat, idx) => {
            const p = tilePalette[idx % tilePalette.length];
            const count = categoryCounts[cat];
            return (
              <div
                key={cat}
                onClick={() => onSelectCategory(cat)}
                style={{
                  borderRadius: 16,
                  background: `${p.bg}`,
                  padding: 24,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: p.text, marginBottom: 4 }}>
                    {cat}
                  </div>
                  <div style={{ fontSize: 13, color: p.text, opacity: 0.7 }}>
                    {count} 道题
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4, color: p.accent, fontSize: 13, fontWeight: 600 }}>
                    开始刷题 <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
