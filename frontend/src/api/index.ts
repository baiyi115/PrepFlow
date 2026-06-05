import { request } from '../utils/request';
import type { 
  UserVO, LoginVO, QuestionVO, QuestionDetailVO, 
  SubmitAnswerVO, UserSubmitVO, UserWrongBookVO, CategoryStatVO, WeaknessAnalysisVO,
  UserProfileVO, CalendarItemVO, GroupedWrongBookVO, UpdateProfileRequest
} from '../types';
 
export const userApi = {
  login: (data: Record<string, unknown>) => request<LoginVO>('/users/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: Record<string, unknown>) => request<number>('/users/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<void>('/users/logout', { method: 'POST' }),
  getMe: () => request<UserVO>('/users/me', { skipErrorHandler: true }),
  updateProfile: (data: UpdateProfileRequest) => request<boolean>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<string>('/users/me/avatar', { method: 'POST', body: formData });
  },
  getProfile: () => request<UserProfileVO>('/users/me/profile')
};
 
export const questionApi = {
  getList: () => request<QuestionVO[]>('/questions'),
  getDetail: (id: string) => request<QuestionDetailVO>(`/questions/${id}`)
};

export const submitApi = {
  submitAnswer: (data: { questionId: string; selectedOptionLabel: string; submitToken: string }) => 
    request<SubmitAnswerVO>('/submits', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: () => request<UserSubmitVO[]>('/submits'),
  getWrongs: () => request<UserWrongBookVO[]>('/submits/wrongs'),
  getCategoryStat: () => request<CategoryStatVO[]>('/submits/statistics/category'),
  getWeaknessAnalysis: () => request<WeaknessAnalysisVO[]>('/submits/analysis/weakness'),
  getCalendar: (days = 365) => request<CalendarItemVO[]>(`/submits/calendar?days=${days}`),
  getWrongsGrouped: () => request<GroupedWrongBookVO[]>('/submits/wrongs/grouped-by-category')
};

export const suggestionApi = {
  getWeaknessSuggestion: (category: string) =>
    request<string>('/suggestions/weakness', { method: 'POST', body: JSON.stringify({ category }) }),
};

export const adminApi = {
  addQuestion: (data: Record<string, unknown>) => request<number>('/admin/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (data: Record<string, unknown>) => request<boolean>('/admin/questions', { method: 'PUT', body: JSON.stringify(data) }),
  getQuestionDetail: (id: string) => request<QuestionDetailVO>(`/admin/questions/${id}`),
  deleteQuestion: (id: string) => request<boolean>(`/admin/questions/${id}`, { method: 'DELETE' }),
  listUsers: () => request<UserVO[]>('/admin/users'),
  updateUserStatus: (data: { userId: string; status: number }) => request<boolean>('/admin/users/status', { method: 'PUT', body: JSON.stringify(data) })
};
