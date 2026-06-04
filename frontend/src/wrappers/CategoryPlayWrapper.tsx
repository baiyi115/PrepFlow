import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { QuestionDetailVO, SubmitAnswerVO } from '../types';
import { pageStorage } from '../utils/pageStorage';
import { QuestionPlay } from '../components/QuestionPlay';

interface CategoryPlayWrapperProps {
  loadingKey: string | null;
  question: QuestionDetailVO | null;
  selectedOption: string;
  onSelectOption: (opt: string) => void;
  submitResult: SubmitAnswerVO | null;
  onSubmit: () => void;
  getPrevAndNextId: (categoryFromUrl?: string) => { prevId: string | null; nextId: string | null; currentIndex: number; totalCount: number; originalIndex: number };
  handleQuestionLink: (qId: string, categoryName?: string) => void;
  proceedLoadQuestionDetail: (qId: string, isReadOnly?: boolean) => Promise<void>;
  checkUnsavedChanges: () => boolean;
}

export function CategoryPlayWrapper({
  loadingKey,
  question,
  selectedOption,
  onSelectOption,
  submitResult,
  onSubmit,
  getPrevAndNextId,
  handleQuestionLink,
  proceedLoadQuestionDetail,
  checkUnsavedChanges
}: CategoryPlayWrapperProps) {
  const { category, questionId } = useParams<{ category?: string; questionId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (questionId) {
      proceedLoadQuestionDetail(questionId, false);
    }
  }, [questionId, proceedLoadQuestionDetail]);

  const { prevId, nextId, currentIndex, totalCount, originalIndex } = getPrevAndNextId(category);

  const handleBack = () => {
    if (!checkUnsavedChanges()) return;
    pageStorage.setActiveQuestionId(null);
    if (category) {
      navigate(`/practice/${category}`);
    } else {
      navigate('/practice');
    }
  };

  const showSpinner = loadingKey === 'question' || !question || question.id !== questionId;
  if (showSpinner) {
    return (
      <div className="page-loading-center">
        <div className="custom-spin" />
      </div>
    );
  }

  return (
    <QuestionPlay
      question={question}
      selectedOption={selectedOption}
      onSelectOption={onSelectOption}
      submitResult={submitResult}
      onSubmit={onSubmit}
      onBack={handleBack}
      backText={category ? `返回 ${category} 专题` : '返回题库'}
      prevQuestionId={prevId}
      nextQuestionId={nextId}
      questionIndex={currentIndex}
      totalQuestions={totalCount}
      originalIndex={originalIndex}
      onGoToDetail={(qId) => handleQuestionLink(qId, category)}
    />
  );
}
