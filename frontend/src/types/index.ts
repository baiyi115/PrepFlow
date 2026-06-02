export interface UserVO {
  userId: string;
  username: string;
  nickname: string;
  avatarUrl?: string;
  userRole?: number; // 0=普通用户 1=管理员
  status?: number; // 0=正常 1=禁用
}

export interface LoginVO {
  userId: string;
  username: string;
  nickname: string;
  avatarUrl?: string;
  tokenName: string;
  tokenValue: string;
}

export interface QuestionOptionVO {
  optionLabel: string;
  optionContent: string;
  sortOrder: number;
}

export interface QuestionVO {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  questionType: number;
}

export interface QuestionDetailVO {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: number;
  questionType: number;
  analysis?: string;
  correctOptionLabel?: string;
  options: QuestionOptionVO[];
}

export interface SubmitAnswerVO {
  submitId: string;
  questionId: string;
  isCorrect: number;
  score: string;
  submitStatus: number;
  selectedOptionLabel: string;
  correctOptionLabel: string;
  analysis: string;
}

export interface UserSubmitVO {
  submitId: string;
  questionId: string;
  questionType: number;
  selectedOptionLabel: string;
  correctOptionLabel: string;
  isCorrect: number;
  score: string;
  createTime: string;
  questionTitle?: string;
  category?: string;
  difficulty?: number;
  analysis?: string;
}

export interface UserWrongBookVO {
  id: string;
  questionId: string;
  title: string;
  category: string;
  difficulty: number;
  reviewStage: number;
  nextReviewTime: string;
}

export interface CategoryStatVO {
  category: string;
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  correctRate: string;
}

export interface WeaknessAnalysisVO {
  category: string;
  correctRate: string;
  level: string;
  suggestion: string;
}

export interface UserProfileVO {
  userProfile: UserVO;
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  correctRate: string;
  activeWrongCount: number;
  recentSubmits: UserSubmitVO[];
  categoryStats: CategoryStatVO[];
  weaknesses: WeaknessAnalysisVO[];
}

export interface CalendarItemVO {
  date: string;
  count: number;
}

export interface GroupedWrongBookVO {
  category: string;
  totalCount: number;
  dueCount: number;
  list: UserWrongBookVO[];
}

export interface UpdateProfileRequest {
  nickname?: string;
  avatarUrl?: string;
}

export interface BaseResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}
