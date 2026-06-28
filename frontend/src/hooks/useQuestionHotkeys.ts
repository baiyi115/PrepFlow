import { useEffect } from 'react';
import type { QuestionDetailVO } from '../types';

interface UseQuestionHotkeysParams {
  question: QuestionDetailVO;
  selectedOption: string;
  hasSubmitted: boolean;
  hasNextQuestion: boolean;
  nextQuestionId: string | null;
  onSelectOption: (optionLabel: string) => void;
  onSubmit: () => void;
  onGoToDetail: (id: string) => void;
}

export function useQuestionHotkeys({
  question,
  selectedOption,
  hasSubmitted,
  hasNextQuestion,
  nextQuestionId,
  onSelectOption,
  onSubmit,
  onGoToDetail,
}: UseQuestionHotkeysParams) {
  useEffect(() => {
    if (question.questionType !== 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const key = e.key.toUpperCase();
      if (!hasSubmitted) {
        if (['A', 'B', 'C', 'D'].includes(key)) {
          if (question.options?.some(opt => opt.optionLabel === key)) onSelectOption(key);
        }
        if (key === 'ENTER' && selectedOption) onSubmit();
      } else if (hasNextQuestion && key === 'ENTER' && nextQuestionId) {
        onGoToDetail(nextQuestionId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedOption,
    hasSubmitted,
    question.options,
    question.questionType,
    onSubmit,
    onSelectOption,
    hasNextQuestion,
    nextQuestionId,
    onGoToDetail,
  ]);
}
