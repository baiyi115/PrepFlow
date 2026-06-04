import { useParams, useNavigate } from 'react-router-dom';
import type { GroupedWrongBookVO } from '../types';
import { WrongBook } from '../components/WrongBook';

interface WrongBookWrapperProps {
  wrongData: GroupedWrongBookVO[];
  setActivePracticeQueue: (queue: string[]) => void;
}

export function WrongBookWrapper({ wrongData, setActivePracticeQueue }: WrongBookWrapperProps) {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();

  const handleGoToDetail = (qId: string, queueIds?: string[]) => {
    if (queueIds && queueIds.length > 0) {
      setActivePracticeQueue([...new Set(queueIds)]);
    }
    navigate(`/wrong/play/${qId}${category ? `?from=${category}` : ''}`);
  };

  return (
    <WrongBook
      key={category || 'wrong-book'}
      data={wrongData}
      initialCategory={category || null}
      onGoToDetail={handleGoToDetail}
    />
  );
}
