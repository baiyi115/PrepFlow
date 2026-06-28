import type { CSSProperties } from 'react';
import { Check, X } from 'lucide-react';
import type { QuestionDetailVO, SubmitAnswerVO } from '../types';
import { useColors } from '../context/themeHooks';

interface QuestionOptionsProps {
  question: QuestionDetailVO;
  selectedOption: string;
  submitResult: SubmitAnswerVO | null;
  hasSubmitted: boolean;
  onSelectOption: (optionLabel: string) => void;
}

export function QuestionOptions({
  question,
  selectedOption,
  submitResult,
  hasSubmitted,
  onSelectOption,
}: QuestionOptionsProps) {
  const colors = useColors();

  return (
    <div className="option-list">
      {question.options?.map(opt => {
        const isSelected = selectedOption === opt.optionLabel;
        const isCorrectOption = hasSubmitted && submitResult?.correctOptionLabel === opt.optionLabel;
        const isWrongSelection = hasSubmitted && isSelected && !isCorrectOption;
        let bg = colors.surface;
        let borderColor = colors.ringSubtle;
        let textColor = colors.gray800;
        let labelBg = colors.surface;
        let labelColor = colors.gray600;
        let labelRing = colors.gray300;

        if (!hasSubmitted && isSelected) {
          borderColor = colors.primary;
          bg = colors.primaryBg;
          labelBg = colors.primary;
          labelColor = '#fff';
          labelRing = colors.primary;
        }

        if (isCorrectOption) {
          borderColor = colors.success;
          bg = colors.successBg;
          textColor = colors.successHover;
          labelBg = colors.success;
          labelColor = '#fff';
          labelRing = colors.success;
        } else if (isWrongSelection) {
          borderColor = colors.error;
          bg = colors.errorBg;
          textColor = colors.errorHover;
          labelBg = colors.error;
          labelColor = '#fff';
          labelRing = colors.error;
        }

        const labelStyle: CSSProperties = {
          background: labelBg,
          boxShadow: `0 0 0 1px ${labelRing}`,
          color: labelColor,
        };

        const optionClasses = [
          'option-card',
          (!hasSubmitted && isSelected) ? 'selected' : '',
          hasSubmitted ? 'submitted' : '',
          (hasSubmitted && !isSelected && submitResult?.correctOptionLabel === opt.optionLabel) ? 'correct-bounce' : '',
          (hasSubmitted && isSelected && submitResult?.correctOptionLabel !== opt.optionLabel) ? 'wrong-shake' : '',
        ].filter(Boolean).join(' ');

        // 未提交的选中态由 .option-card.selected 出高亮阴影，inline 仅负责其它状态的描边
        const isUnsubmittedSelected = !hasSubmitted && isSelected;

        return (
          <div
            key={opt.optionLabel}
            className={optionClasses}
            onClick={() => { if (!hasSubmitted) onSelectOption(opt.optionLabel); }}
            style={{ background: bg, color: textColor, ...(isUnsubmittedSelected ? {} : { boxShadow: `0 0 0 1.5px ${borderColor}` }) }}
          >
            <div className="option-content">
              <span className="option-label" style={labelStyle}>{opt.optionLabel}</span>
              <span className="option-text">{opt.optionContent}</span>
              {isCorrectOption && (
                <span className="option-result-label" style={{ color: colors.successHover }}>
                  <Check size={13} strokeWidth={3} /> 正确
                </span>
              )}
              {isWrongSelection && (
                <span className="option-result-label" style={{ color: colors.errorHover }}>
                  <X size={13} strokeWidth={3} /> 您选的
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
