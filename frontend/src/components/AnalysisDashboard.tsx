import React, { useState, useCallback, useMemo } from 'react';
import { Button } from 'antd';
import type { CategoryStatVO, WeaknessAnalysisVO } from '../types';
import { useColors } from '../context/themeHooks';
import { suggestionApi } from '../api';
import { toast } from '../utils/toast';
import ReactMarkdown from 'react-markdown';
import { BarChart3, Sparkles, X } from 'lucide-react';

interface Props {
  statData: CategoryStatVO[];
  analysisData: WeaknessAnalysisVO[];
  onReviewWrongCategory: (category: string) => void;
}

export const AnalysisDashboard: React.FC<Props> = ({ statData, analysisData, onReviewWrongCategory }) => {
  const colors = useColors();
  const levelColors = useMemo<Record<string, string>>(() => ({
    '薄弱': colors.error,
    '一般': colors.primary,
    '良好': colors.success,
    '优秀': colors.success,
  }), [colors]);
  const hasStats = statData.length > 0;
  const totalCount = statData.reduce((sum, item) => sum + item.totalCount, 0);
  const correctCount = statData.reduce((sum, item) => sum + item.correctCount, 0);
  const wrongCount = statData.reduce((sum, item) => sum + item.wrongCount, 0);
  const totalRate = totalCount > 0 ? ((correctCount * 100) / totalCount).toFixed(1) : '0.0';
  const weaknessCount = analysisData.filter(item => item.level === '薄弱').length;
  const analysisMap = useMemo(() => new Map(analysisData.map(item => [item.category, item])), [analysisData]);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string | null>>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

  const handleAiSuggestion = useCallback(async (category: string) => {
    if (aiSuggestions[category]) return;
    setLoadingSuggestion(category);
    try {
      const res = await suggestionApi.getWeaknessSuggestion(category);
      if (res.code === 0) {
        setAiSuggestions(prev => ({ ...prev, [category]: res.data }));
      } else {
        toast.error('获取 AI 建议失败');
      }
    } catch {
      toast.error('获取 AI 建议失败');
    } finally {
      setLoadingSuggestion(null);
    }
  }, [aiSuggestions]);

  if (!hasStats) {
    return (
      <div className="empty-state">
        <BarChart3 size={40} style={{ marginBottom: 16, opacity: 0.48 }} />
        <div className="empty-state-title">暂无能力诊断</div>
        <div className="empty-state-text">完成几道题后，按分类生成正确率与复习建议。</div>
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
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1 className="page-heading">能力分析</h1>
          <p className="page-description">按分类查看正确率、薄弱项和针对性复习建议。</p>
        </div>
      </div>

      <div className="metric-grid">
        {statTiles.map(s => (
          <div key={s.label} className="metric-card">
            <div className="metric-label">{s.label}</div>
            <div className="metric-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="notice-strip" style={{ background: weaknessCount > 0 ? colors.errorBg : colors.successBg }}>
        <span className="notice-strip-dot" style={{ background: weaknessCount > 0 ? colors.error : colors.success }} />
        <span style={{ fontSize: 13, color: colors.gray700, lineHeight: 1.5, fontWeight: 500 }}>
          {weaknessCount > 0
            ? `当前有 ${weaknessCount} 个薄弱分类，建议优先从薄弱项开始复盘。`
            : '当前没有明显薄弱分类，继续保持稳定练习。'}
        </span>
      </div>

      <h2 className="section-title">各分类能力诊断</h2>

      <div className="diagnosis-grid">
        {statData.map(stat => {
          const rate = Number.parseFloat(stat.correctRate).toFixed(1);
          const analysis = analysisMap.get(stat.category);
          const level = analysis?.level || 'unknown';
          const accent = levelColors[level] || colors.gray500;

          return (
            <div key={stat.category} className="diagnosis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: colors.gray800 }}>{stat.category}</span>
                {analysis && <span style={{ fontSize: 12, fontWeight: 600, color: accent }}>{analysis.level}</span>}
              </div>
              <div style={{ fontSize: 13, color: colors.gray500, marginBottom: 10 }}>
                答题 {stat.totalCount} 次 · 正确 {stat.correctCount} · 错误 {stat.wrongCount}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="progress-track" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${rate}%`, background: accent }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: accent, minWidth: 44, textAlign: 'right' }}>{rate}%</span>
              </div>
              <div style={{ fontSize: 13, color: colors.gray600, lineHeight: 1.5, minHeight: 36 }}>
                {analysis?.suggestion || '继续完成更多题目后生成更准确的建议。'}
              </div>
              <div className="filter-group" style={{ marginTop: 12 }}>
                {stat.wrongCount > 0 && (
                  <Button size="small" onClick={() => onReviewWrongCategory(stat.category)}>
                    复盘错题
                  </Button>
                )}
                {!aiSuggestions[stat.category] && (
                  <Button
                    size="small"
                    type="dashed"
                    onClick={() => handleAiSuggestion(stat.category)}
                    loading={loadingSuggestion === stat.category}
                    icon={<Sparkles size={14} />}
                    style={{ color: colors.primary }}
                  >
                    AI 学习建议
                  </Button>
                )}
              </div>
              {aiSuggestions[stat.category] && (
                <div className="ai-panel">
                  <div className="ai-panel-header">
                    <span className="ai-panel-title">AI 学习建议</span>
                    <button
                      className="ai-close-button"
                      onClick={() => setAiSuggestions(prev => ({ ...prev, [stat.category]: null }))}
                      aria-label="关闭 AI 建议"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const isBlock = /language-(\w+)/.exec(className || '');
                        return isBlock ? (
                          <code className={className} style={{ fontSize: 13 }} {...props}>{children}</code>
                        ) : (
                          <code style={{ background: colors.gray100, padding: '1px 5px', borderRadius: 4, fontSize: 13 }} {...props}>{children}</code>
                        );
                      },
                      a({ href, children }) {
                        return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary }}>{children}</a>;
                      },
                    }}
                  >
                    {aiSuggestions[stat.category]}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
