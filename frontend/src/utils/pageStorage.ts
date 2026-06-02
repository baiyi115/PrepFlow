const ACTIVE_KEY = 'activeKey';
const SELECTED_CATEGORY = 'selectedCategory';
const ACTIVE_PRACTICE_QUEUE = 'activePracticeQueue';
const ACTIVE_QUESTION_ID = 'activeQuestionId';

export const pageStorage = {
  getActiveKey: () => sessionStorage.getItem(ACTIVE_KEY) || 'practice',
  setActiveKey: (value: string) => sessionStorage.setItem(ACTIVE_KEY, value),

  getSelectedCategory: () => sessionStorage.getItem(SELECTED_CATEGORY),
  setSelectedCategory: (value: string | null) => {
    if (value) sessionStorage.setItem(SELECTED_CATEGORY, value);
    else sessionStorage.removeItem(SELECTED_CATEGORY);
  },

  getPracticeQueue: () => {
    try {
      const value = sessionStorage.getItem(ACTIVE_PRACTICE_QUEUE);
      return value ? JSON.parse(value) as string[] : [];
    } catch {
      return [];
    }
  },
  setPracticeQueue: (value: string[]) => {
    if (value.length > 0) sessionStorage.setItem(ACTIVE_PRACTICE_QUEUE, JSON.stringify(value));
    else sessionStorage.removeItem(ACTIVE_PRACTICE_QUEUE);
  },

  getActiveQuestionId: () => sessionStorage.getItem(ACTIVE_QUESTION_ID),
  setActiveQuestionId: (value: string | null) => {
    if (value) sessionStorage.setItem(ACTIVE_QUESTION_ID, String(value));
    else sessionStorage.removeItem(ACTIVE_QUESTION_ID);
  },

  clearPracticeState: () => {
    sessionStorage.removeItem(ACTIVE_QUESTION_ID);
    sessionStorage.removeItem(SELECTED_CATEGORY);
    sessionStorage.removeItem(ACTIVE_PRACTICE_QUEUE);
  }
};
