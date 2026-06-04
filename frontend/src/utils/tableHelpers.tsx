import { Tag } from 'antd';
import type { ReactNode } from 'react';
import { lightColors } from '../theme/tokens';

export type SortOrder = 'default' | 'asc' | 'desc';
export type SortField = 'difficulty' | 'title';

export interface SortState {
  sortBy: SortField | 'none';
  order: SortOrder;
}

export const defaultSortState: SortState = { sortBy: 'none', order: 'default' };

export const getNextSortState = (prev: SortState, field: SortField): SortState => {
  if (prev.sortBy !== field) return { sortBy: field, order: 'asc' };
  if (prev.order === 'default') return { sortBy: field, order: 'asc' };
  if (prev.order === 'asc') return { sortBy: field, order: 'desc' };
  return defaultSortState;
};

export const getSortArrow = (sortState: SortState, field: SortField) => {
  if (sortState.sortBy !== field) return ' ↕';
  if (sortState.order === 'asc') return ' ↑';
  if (sortState.order === 'desc') return ' ↓';
  return ' ↕';
};

export const getSortArrowColor = (sortState: SortState, field: SortField) => {
  return sortState.sortBy === field && sortState.order !== 'default' ? lightColors.primary : lightColors.gray500;
};

export const renderSortableHeader = (label: string, field: SortField, sortState: SortState, onSort: (field: SortField) => void): ReactNode => (
  <div style={{ cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center' }} onClick={() => onSort(field)}>
    <span>{label}</span>
    <span style={{ marginLeft: 4, color: getSortArrowColor(sortState, field), fontWeight: 'bold' }}>{getSortArrow(sortState, field)}</span>
  </div>
);

export const difficultyOptions = [
  { label: '全部', value: 'all' },
  { label: '简单', value: '1' },
  { label: '中等', value: '2' },
  { label: '困难', value: '3' }
];

export const renderDifficultyTag = (difficulty: number) => {
  if (difficulty === 1) return <Tag color="success" style={{ borderRadius: 4, padding: '2px 8px' }}>简单</Tag>;
  if (difficulty === 2) return <Tag color="warning" style={{ borderRadius: 4, padding: '2px 8px' }}>中等</Tag>;
  return <Tag color="error" style={{ borderRadius: 4, padding: '2px 8px' }}>困难</Tag>;
};

export const sortByTitleOrDifficulty = <T extends { title?: string; difficulty: number }>(items: T[], sortState: SortState) => {
  if (sortState.sortBy === 'none' || sortState.order === 'default') return items;
  return [...items].sort((a, b) => {
    if (sortState.sortBy === 'difficulty') {
      return sortState.order === 'asc' ? a.difficulty - b.difficulty : b.difficulty - a.difficulty;
    }
    const valA = a.title || '';
    const valB = b.title || '';
    return sortState.order === 'asc'
      ? valA.localeCompare(valB, 'zh-CN')
      : valB.localeCompare(valA, 'zh-CN');
  });
};
