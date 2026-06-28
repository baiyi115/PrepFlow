import { useCallback, useState } from 'react';
import { submitApi, userApi } from '../api';
import { getToken } from '../utils/request';
import type {
  CalendarItemVO,
  CategoryStatVO,
  GroupedWrongBookVO,
  UserProfileVO,
  UserSubmitVO,
  UserVO,
  WeaknessAnalysisVO,
} from '../types';

export function usePageData(onProfileUserLoaded: (user: UserVO) => void) {
  const [historyData, setHistoryData] = useState<UserSubmitVO[]>([]);
  const [wrongData, setWrongData] = useState<GroupedWrongBookVO[]>([]);
  const [statData, setStatData] = useState<CategoryStatVO[]>([]);
  const [analysisData, setAnalysisData] = useState<WeaknessAnalysisVO[]>([]);
  const [profileData, setProfileData] = useState<UserProfileVO | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarItemVO[]>([]);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [pageError, setPageError] = useState('');

  const loadHistoryData = useCallback(async (silent = false) => {
    if (!getToken()) return;
    if (!silent) {
      setLoadingKey('history');
      setPageError('');
    }
    try {
      const res = await submitApi.getHistory();
      if (res.code === 0) {
        setHistoryData(res.data);
      }
      else if (!silent) setPageError(res.message || '答题历史加载失败');
    } catch (err: unknown) {
      console.error(err);
      if (!silent) setPageError('答题历史加载失败，请稍后重试');
    } finally {
      if (!silent) setLoadingKey(null);
    }
  }, []);

  const loadWrongData = useCallback(async (silent = false) => {
    if (!getToken()) return;
    if (!silent) {
      setLoadingKey('wrong');
      setPageError('');
    }
    try {
      const res = await submitApi.getWrongsGrouped();
      if (res.code === 0) setWrongData(res.data);
      else if (!silent) setPageError(res.message || '错题本加载失败');
    } catch (err: unknown) {
      console.error(err);
      if (!silent) setPageError('错题本加载失败，请稍后重试');
    } finally {
      if (!silent) setLoadingKey(null);
    }
  }, []);

  const loadStatAndAnalysisData = useCallback(async (silent = false) => {
    if (!getToken()) return;
    if (!silent) {
      setLoadingKey('assess');
      setPageError('');
    }
    try {
      const resStat = await submitApi.getCategoryStat();
      if (resStat.code === 0) setStatData(resStat.data);
      else if (!silent) setPageError(resStat.message || '能力评估加载失败');
      const resAna = await submitApi.getWeaknessAnalysis();
      if (resAna.code === 0) setAnalysisData(resAna.data);
      else if (!silent) setPageError(resAna.message || '能力评估加载失败');
    } catch (err: unknown) {
      console.error(err);
      if (!silent) setPageError('能力评估加载失败，请稍后重试');
    } finally {
      if (!silent) setLoadingKey(null);
    }
  }, []);

  const loadProfileData = useCallback(async () => {
    if (!getToken()) return;
    setLoadingKey('profile');
    setPageError('');
    try {
      const [profileRes, calendarRes] = await Promise.all([
        userApi.getProfile(),
        submitApi.getCalendar(30),
      ]);

      if (profileRes.code === 0) {
        setProfileData(profileRes.data);
        onProfileUserLoaded(profileRes.data.userProfile);
        setStatData(profileRes.data.categoryStats);
        setAnalysisData(profileRes.data.weaknesses);
      }
      if (calendarRes.code === 0) setCalendarData(calendarRes.data);

      if ([profileRes, calendarRes].some(res => res.code !== 0)) {
        setPageError('个人主页数据加载失败');
      }
    } catch (err: unknown) {
      console.error(err);
      setPageError('个人主页数据加载失败，请稍后重试');
    } finally {
      setLoadingKey(null);
    }
  }, [onProfileUserLoaded]);

  const updateProfileUser = useCallback((patch: Partial<UserVO>) => {
    setProfileData(prev => prev ? { ...prev, userProfile: { ...prev.userProfile, ...patch } } : prev);
  }, []);

  return {
    historyData,
    wrongData,
    statData,
    analysisData,
    profileData,
    calendarData,
    loadingKey,
    pageError,
    setPageError,
    setLoadingKey,
    loadHistoryData,
    loadWrongData,
    loadStatAndAnalysisData,
    loadProfileData,
    updateProfileUser,
  };
}
