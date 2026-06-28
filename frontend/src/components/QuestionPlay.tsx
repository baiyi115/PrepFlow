import type { FC } from 'react';
import { Button } from 'antd';
import { Check, X } from 'lucide-react';
import type { QuestionDetailVO, SubmitAnswerVO } from '../types';
import { QuestionOptions } from './QuestionOptions';
import { AiAnalysisPanel } from './AiAnalysisPanel';
import { useQuestionHotkeys } from '../hooks/useQuestionHotkeys';
import { useColors } from '../context/themeHooks';

interface Props {
  question: QuestionDetailVO;
  selectedOption: string;
  submitResult: SubmitAnswerVO | null;
  onSelectOption: (optionLabel: string) => void;
  onSubmit: () => void;
  onGoToDetail: (id: string) => void;
  prevQuestionId: string | null;
  nextQuestionId: string | null;
  questionIndex?: number;
  totalQuestions?: number;
  originalIndex?: number;
  backText?: string;
  onBack?: () => void;
}

function SubmitResultPanel({ submitResult }: { submitResult: SubmitAnswerVO }) {
  const colors = useColors();
  const isCorrect = submitResult.isCorrect === 1;
  const accent = isCorrect ? colors.success : colors.error;
  const textColor = isCorrect ? colors.successHover : colors.errorHover;

  return (
    <div className="result-panel" style={{ background: isCorrect ? colors.successBg : colors.errorBg }}>
      <div className="result-panel-inner">
        <div className="result-panel-title" style={{ color: textColor }}>
          <span className="result-icon" style={{ background: accent }}>
            {isCorrect ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
          </span>
          {isCorrect ? '回答正确' : '回答错误'}
        </div>
        {submitResult.analysis && (
          <div style={{ color: colors.gray700, fontSize: 14, lineHeight: 1.7 }}>
            <span style={{ fontWeight: 600 }}>解析：</span>{submitResult.analysis}
          </div>
        )}
      </div>
    </div>
  );
}

export const QuestionPlay: FC<Props> = ({
  question,
  selectedOption,
  onSelectOption,
  submitResult,
  onSubmit,
  onBack,
  prevQuestionId,
  nextQuestionId,
  questionIndex,
  totalQuestions,
  originalIndex,
  onGoToDetail,
  backText = '返回列表',
}) => {
  const hasSubmitted = !!submitResult;
  const hasPrevQuestion = !!prevQuestionId;
  const hasNextQuestion = !!nextQuestionId;

  useQuestionHotkeys({
    question,
    selectedOption,
    hasSubmitted,
    hasNextQuestion,
    nextQuestionId,
    onSelectOption,
    onSubmit,
    onGoToDetail,
  });

  if (question.questionType !== 1) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">题型暂不支持</div>
        <div className="empty-state-text" style={{ marginBottom: 24 }}>当前系统主要支持选择题。</div>
        <div className="filter-group" style={{ justifyContent: 'center' }}>
          <Button disabled={!hasPrevQuestion} onClick={() => hasPrevQuestion && onGoToDetail(prevQuestionId)}>上一题</Button>
          <Button disabled={!hasNextQuestion} onClick={() => hasNextQuestion && onGoToDetail(nextQuestionId)}>下一题</Button>
        </div>
      </div>
    );
  }

  return (
    <div key={question.id} className="question-shell question-enter">
      <div className="question-meta">
        <span>第 {questionIndex ?? '?'} / {totalQuestions ?? '?'} 题</span>
        {originalIndex !== undefined && <span>题库第 {originalIndex} 题</span>}
      </div>

      <div className="question-title-row">
        <h2 className="question-title">{question.title}</h2>
        <Button type="text" size="small" onClick={onBack} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{backText}</Button>
      </div>

      {question.content && (question.questionType !== 1 || question.content !== question.title) && (
        <div className="question-content-card">{question.content}</div>
      )}

      <QuestionOptions
        question={question}
        selectedOption={selectedOption}
        submitResult={submitResult}
        hasSubmitted={hasSubmitted}
        onSelectOption={onSelectOption}
      />

      <div className="question-actions">
        <Button disabled={!hasPrevQuestion} onClick={() => hasPrevQuestion && onGoToDetail(prevQuestionId)}>上一题</Button>
        <Button
          type="primary"
          size="large"
          onClick={onSubmit}
          disabled={!selectedOption || hasSubmitted}
          className={!hasSubmitted && selectedOption ? 'submit-glow' : ''}
          style={{ padding: '0 32px', height: 44 }}
        >
          {hasSubmitted ? '已提交' : '提交答案'}
        </Button>
        <Button disabled={!hasNextQuestion} onClick={() => hasNextQuestion && onGoToDetail(nextQuestionId)}>
          {hasNextQuestion ? '下一题' : '已到最后一题'}
        </Button>
      </div>

      {submitResult && <SubmitResultPanel submitResult={submitResult} />}
      {submitResult && <AiAnalysisPanel submitResult={submitResult} />}
    </div>
  );
};
