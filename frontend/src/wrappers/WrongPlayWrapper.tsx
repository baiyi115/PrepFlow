import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { QuestionDetailVO, SubmitAnswerVO, GroupedWrongBookVO } from '../types';
import { pageStorage } from '../utils/pageStorage';
import { QuestionPlay } from '../components/QuestionPlay';

interface WrongPlayWrapperProps {
  loadingKey: string | null;
  question: QuestionDetailVO | null;
  selectedOption: string;
  onSelectOption: (opt: string) => void;
  submitResult: SubmitAnswerVO | null;
  onSubmit: () => void;
  getPrevAndNextId: (categoryFromUrl?: string) => { prevId: string | null; nextId: string | null; currentIndex: number; totalCount: number; originalIndex: number };
  proceedLoadQuestionDetail: (qId: string, isReadOnly?: boolean) => Promise<void>;
  checkUnsavedChanges: () => boolean;
  wrongData: GroupedWrongBookVO[];
  setActivePracticeQueue: (queue: string[]) => void;
}

export function WrongPlayWrapper({
  loadingKey,
  question,
  selectedOption,
  onSelectOption,
  submitResult,
  onSubmit,
  getPrevAndNextId,
  proceedLoadQuestionDetail,
  checkUnsavedChanges,
  wrongData,
  setActivePracticeQueue
}: WrongPlayWrapperProps) {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const fromCategory = query.get('from');

  useEffect(() => {
    if (questionId) {
      proceedLoadQuestionDetail(questionId, false);
    }
  }, [questionId, proceedLoadQuestionDetail]);

  useEffect(() => {
    if (questionId && wrongData.length > 0) {
      let queueMatch: string[] = [];
      for (const group of wrongData) {
        const item = group.list.find(q => q.questionId === questionId);
        if (item) {
          const now = Date.now();
          queueMatch = group.list
            .filter(q => !q.nextReviewTime || now >= new Date(q.nextReviewTime).getTime())
            .map(q => q.questionId);
          break;
        }
      }
      if (queueMatch.length > 0) {
        setActivePracticeQueue([...new Set(queueMatch)]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, wrongData]);

  const { prevId, nextId, currentIndex, totalCount, originalIndex } = getPrevAndNextId(fromCategory || undefined);

  const handleBack = () => {
    if (!checkUnsavedChanges()) return;
    pageStorage.setActiveQuestionId(null);
    if (fromCategory) {
      navigate(`/wrong/${fromCategory}`);
    } else {
      navigate('/wrong');
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
      backText="返回错题列表"
      prevQuestionId={prevId}
      nextQuestionId={nextId}
      questionIndex={currentIndex}
      totalQuestions={totalCount}
      originalIndex={originalIndex}
      onGoToDetail={(qId) => {
        navigate(`/wrong/play/${qId}${fromCategory ? `?from=${fromCategory}` : ''}`);
      }}
    />
  );
}
