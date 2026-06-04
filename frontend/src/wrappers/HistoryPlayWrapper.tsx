import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { QuestionDetailVO, UserSubmitVO } from '../types';
import { QuestionReview } from '../components/QuestionReview';

interface HistoryPlayWrapperProps {
  loadingKey: string | null;
  question: QuestionDetailVO | null;
  historyData: UserSubmitVO[];
  setActiveSubmitId: (id: string | null) => void;
  setActiveHistoryQueue: (queue: string[]) => void;
  prevSubmitId: string | null;
  nextSubmitId: string | null;
  handleHistorySubmitNav: (submitId: string) => void;
  proceedLoadQuestionDetail: (qId: string, isReadOnly?: boolean) => Promise<void>;
  checkUnsavedChanges: () => boolean;
}

export function HistoryPlayWrapper({
  loadingKey,
  question,
  historyData,
  setActiveSubmitId,
  setActiveHistoryQueue,
  prevSubmitId,
  nextSubmitId,
  handleHistorySubmitNav,
  proceedLoadQuestionDetail,
  checkUnsavedChanges
}: HistoryPlayWrapperProps) {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (questionId) {
      proceedLoadQuestionDetail(questionId, true);
    }
  }, [questionId, proceedLoadQuestionDetail]);

  useEffect(() => {
    if (questionId && historyData.length > 0) {
      const match = historyData.find(item => item.questionId === questionId);
      if (match) {
        setActiveSubmitId(match.submitId);
        setActiveHistoryQueue(historyData.map(item => item.submitId));
      }
    }
  }, [questionId, historyData, setActiveSubmitId, setActiveHistoryQueue]);

  const activeHistoryRecord = historyData.find(item => item.questionId === questionId) || null;

  const handleBack = () => {
    if (!checkUnsavedChanges()) return;
    navigate('/history');
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
    <QuestionReview
      question={question}
      record={activeHistoryRecord}
      onBack={handleBack}
      prevSubmitId={prevSubmitId}
      nextSubmitId={nextSubmitId}
      onGoToSubmit={handleHistorySubmitNav}
    />
  );
}
