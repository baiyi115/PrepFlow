import React from 'react';
import { Button } from 'antd';
import type { CategoryStatVO, WeaknessAnalysisVO } from '../types';
import { useColors } from '../context/ThemeContext';
import { BarChart3 } from 'lucide-react';

interface Props {
  statData: CategoryStatVO[];
  analysisData: WeaknessAnalysisVO[];
  onReviewWrongCategory: (category: string) => void;
}

export const AnalysisDashboard: React.FC<Props> = ({ statData, analysisData, onReviewWrongCategory }) => {
  const colors = useColors();
  const levelColors: Record<string, string> = {
    '薄弱': colors.error,
    '一般': colors.primary,
    '良好': colors.success,
    '优秀': colors.primary,
  };
  const hasStats = statData.length > 0;
  const totalCount = statData.reduce((sum, item) => sum + item.totalCount, 0);
  const correctCount = statData.reduce((sum, item) => sum + item.correctCount, 0);
  const wrongCount = statData.reduce((sum, item) => sum + item.wrongCount, 0);
  const totalRate = totalCount > 0 ? ((correctCount * 100) / totalCount).toFixed(1) : '0.0';
  const weaknessCount = analysisData.filter(item => item.level === '薄弱').length;
  const analysisMap = new Map(analysisData.map(item => [item.category, item]));

  if (!hasStats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', background: colors.gray100, borderRadius: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: colors.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <BarChart3 size={24} color={colors.gray400} />
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: colors.gray800 }}>暂无能力诊断</h2>
        <p style={{ margin: 0, color: colors.gray500, fontSize: 14 }}>完成几道题后，按分类生成正确率与复习建议</p>
      </div>
    );
  }

  const statTiles = [
    { label: '总答题数', value: totalCount, color: colors.gray900 },
    { label: '正确题数', value: correctCount, color: colors.success },
    { label: '错误题数', value: wrongCount, color: colors.error },
    { label: '总体正确率', value: `${totalRate}%`, color: colors.primary },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {statTiles.map(s => (
          <div key={s.label} style={{ padding: '20px 18px', borderRadius: 14, border: `1px solid ${colors.gray200}`, background: colors.gray100 }}>
            <div style={{ fontSize: 12, color: colors.gray500, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: colors.gray100, marginBottom: 28 }}>
        <div style={{ width: 3, height: 20, borderRadius: 2, background: weaknessCount > 0 ? colors.error : colors.primary, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: colors.gray600, lineHeight: 1.5 }}>
          {weaknessCount > 0
            ? `当前有 ${weaknessCount} 个薄弱分类，建议优先从薄弱项开始复盘`
            : '当前没有明显薄弱分类，继续保持稳定练习'}
        </span>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.gray900, margin: '0 0 16px' }}>各分类能力诊断</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {statData.map(stat => {
          const rate = Number.parseFloat(stat.correctRate).toFixed(1);
          const analysis = analysisMap.get(stat.category);
          const level = analysis?.level || 'unknown';
          const accent = levelColors[level] || colors.gray500;

          return (
            <div key={stat.category} style={{ borderRadius: 14, border: `1px solid ${colors.gray200}`, padding: 20, background: colors.gray100, transition: 'box-shadow 0.25s ease, transform 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: colors.gray800 }}>{stat.category}</span>
                {analysis && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: accent }}>{analysis.level}</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: colors.gray500, marginBottom: 10 }}>
                答题 {stat.totalCount} 次 · 正确 {stat.correctCount} · 错误 {stat.wrongCount}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 10, background: colors.gray200, borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 5, width: `${rate}%`, background: accent }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: accent, minWidth: 44, textAlign: 'right' }}>{rate}%</span>
              </div>
              <div style={{ fontSize: 13, color: colors.gray600, lineHeight: 1.5, minHeight: 36 }}>
                {analysis?.suggestion || '继续完成更多题目后生成更准确的建议'}
              </div>
              {stat.wrongCount > 0 && (
                <Button size="small" onClick={() => onReviewWrongCategory(stat.category)} style={{ marginTop: 10, borderRadius: 8, fontSize: 13 }}>
                  复盘错题
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
