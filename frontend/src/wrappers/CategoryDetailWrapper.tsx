import { useParams, useNavigate } from 'react-router-dom';
import type { QuestionVO } from '../types';
import { QuestionBankDetail } from '../components/QuestionBankDetail';

interface CategoryDetailWrapperProps {
  questionList: QuestionVO[];
  onGoToDetail: (qId: string, categoryName?: string) => void;
  onStartPracticeCategory: (categoryName: string, sortedQuestionIds: string[]) => void;
}

export function CategoryDetailWrapper({ questionList, onGoToDetail, onStartPracticeCategory }: CategoryDetailWrapperProps) {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const categoryName = category || '';

  const handleBack = () => {
    navigate('/practice');
  };

  return (
    <QuestionBankDetail
      category={categoryName}
      questionList={questionList}
      onGoToDetail={(qId) => onGoToDetail(qId, categoryName)}
      onStartPracticeCategory={onStartPracticeCategory}
      onBack={handleBack}
    />
  );
}
