import { useState, useEffect, lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import type { Locale } from 'antd/es/locale';
import { toast } from './utils/toast';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import type { UserVO, QuestionVO, QuestionDetailVO, SubmitAnswerVO, UserSubmitVO, GroupedWrongBookVO, CategoryStatVO, WeaknessAnalysisVO, UserProfileVO, CalendarItemVO } from './types';
import { userApi, questionApi, submitApi } from './api';
import { getToken, setToken as setLocalToken, removeToken } from './utils/request';
import { pageStorage } from './utils/pageStorage';
import { getAntdTheme } from './theme/antdTheme';
import { useColors, useTheme } from './context/ThemeContext';
import type { AuthMode } from './components/AuthModal';
import { MainLayout } from './components/layout/MainLayout';
import './App.css';

const QuestionBankList = lazy(() => import('./components/QuestionBankList').then(m => ({ default: m.QuestionBankList })));

const AnalysisDashboard = lazy(() => import('./components/AnalysisDashboard').then(m => ({ default: m.AnalysisDashboard })));
const HistoryList = lazy(() => import('./components/HistoryList').then(m => ({ default: m.HistoryList })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const CategoryDetailWrapper = lazy(() => import('./wrappers/CategoryDetailWrapper').then(m => ({ default: m.CategoryDetailWrapper })));
const CategoryPlayWrapper = lazy(() => import('./wrappers/CategoryPlayWrapper').then(m => ({ default: m.CategoryPlayWrapper })));
const HistoryPlayWrapper = lazy(() => import('./wrappers/HistoryPlayWrapper').then(m => ({ default: m.HistoryPlayWrapper })));
const WrongBookWrapper = lazy(() => import('./wrappers/WrongBookWrapper').then(m => ({ default: m.WrongBookWrapper })));
const WrongPlayWrapper = lazy(() => import('./wrappers/WrongPlayWrapper').then(m => ({ default: m.WrongPlayWrapper })));
const AdminUserList = lazy(() => import('./components/AdminUserList').then(m => ({ default: m.AdminUserList })));
const AdminQuestionList = lazy(() => import('./components/AdminQuestionList').then(m => ({ default: m.AdminQuestionList })));

function App() {
  const colors = useColors();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState<UserVO | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [questionList, setQuestionList] = useState<QuestionVO[]>([]);
  const [question, setQuestion] = useState<QuestionDetailVO | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [activePracticeQueue, setActivePracticeQueue] = useState<string[]>(() => pageStorage.getPracticeQueue());
  const [questionIdxMap, setQuestionIdxMap] = useState<Record<string, number>>({});

  const [submitToken, setSubmitToken] = useState<string>(() => 'token-ts-' + Date.now());
  const [submitResult, setSubmitResult] = useState<SubmitAnswerVO | null>(null);

  const [historyData, setHistoryData] = useState<UserSubmitVO[]>([]);
  const [activeSubmitId, setActiveSubmitId] = useState<string | null>(null);
  const [activeHistoryQueue, setActiveHistoryQueue] = useState<string[]>([]);
  const [wrongData, setWrongData] = useState<GroupedWrongBookVO[]>([]);
  const [statData, setStatData] = useState<CategoryStatVO[]>([]);
  const [analysisData, setAnalysisData] = useState<WeaknessAnalysisVO[]>([]);
  const [profileData, setProfileData] = useState<UserProfileVO | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarItemVO[]>([]);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string>('');
  const [antdLocale, setAntdLocale] = useState<Locale | null>(null);

  useEffect(() => {
    import('antd/locale/zh_CN').then(m => setAntdLocale(m.default));
  }, []);

  const getPrevAndNextId = (categoryFromUrl?: string) => {
    if (activePracticeQueue.length > 0 && question) {
      const qIdx = activePracticeQueue.indexOf(question.id);
      if (qIdx !== -1) {
        const orig = questionIdxMap[question.id];
        return {
          prevId: qIdx > 0 ? activePracticeQueue[qIdx - 1] : null,
          nextId: qIdx < activePracticeQueue.length - 1 ? activePracticeQueue[qIdx + 1] : null,
          currentIndex: qIdx + 1,
          totalCount: activePracticeQueue.length,
          originalIndex: orig !== undefined ? orig : qIdx + 1,
        };
      }
    }
    if (categoryFromUrl && question) {
      const categoryQuestions = questionList.filter(q => (q.category || '其它未分类') === categoryFromUrl);
      const currentIdx = categoryQuestions.findIndex(q => q.id === question.id);
      return {
        prevId: currentIdx > 0 ? categoryQuestions[currentIdx - 1].id : null,
        nextId: currentIdx >= 0 && currentIdx < categoryQuestions.length - 1 ? categoryQuestions[currentIdx + 1].id : null,
        currentIndex: currentIdx + 1,
        totalCount: categoryQuestions.length,
        originalIndex: currentIdx + 1,
      };
    }
    const currentIdx = questionList.findIndex(q => q.id === question?.id);
    return {
      prevId: currentIdx > 0 ? questionList[currentIdx - 1].id : null,
      nextId: currentIdx >= 0 && currentIdx < questionList.length - 1 ? questionList[currentIdx + 1].id : null,
      currentIndex: currentIdx + 1,
      totalCount: questionList.length,
      originalIndex: currentIdx + 1,
    };
  };

  const activeHistoryIndex = activeSubmitId ? activeHistoryQueue.indexOf(activeSubmitId) : -1;
  const prevSubmitId = activeHistoryIndex > 0 ? activeHistoryQueue[activeHistoryIndex - 1] : null;
  const nextSubmitId = activeHistoryIndex >= 0 && activeHistoryIndex < activeHistoryQueue.length - 1 ? activeHistoryQueue[activeHistoryIndex + 1] : null;

  const handleLocalClear = () => {
    removeToken();
    setCurrentUser(null);
    pageStorage.clearPracticeState();
  };

  const loadQuestionList = async () => {
    setLoadingKey('practice');
    setPageError('');
    try {
      const res = await questionApi.getList();
      if (res.code === 0) setQuestionList(res.data);
      else setPageError(res.message || '题库加载失败');
    } catch (err: unknown) {
      console.error(err);
      setPageError('题库加载失败，请稍后重试');
    } finally {
      setLoadingKey(null);
    }
  };

  const checkUnsavedChanges = (): boolean => {
    if (question && selectedOption && !submitResult) {
      return window.confirm('您当前有未提交的答案，确定要离开吗？');
    }
    return true;
  };

  useEffect(() => {
    pageStorage.setPracticeQueue(activePracticeQueue);
  }, [activePracticeQueue]);

  const loadHistoryData = async (silent = false) => {
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
  };

  const loadWrongData = async (silent = false) => {
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
  };

  const loadStatAndAnalysisData = async (silent = false) => {
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
  };

  const loadProfileData = async () => {
    if (!getToken()) return;
    setLoadingKey('profile');
    setPageError('');
    try {
      const [profileRes, calendarRes] = await Promise.all([
        userApi.getProfile(),
        submitApi.getCalendar(30)
      ]);

      if (profileRes.code === 0) {
        setProfileData(profileRes.data);
        setCurrentUser(profileRes.data.userProfile);
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
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/history')) {
      loadHistoryData();
    } else if (path.startsWith('/wrong')) {
      loadWrongData();
    } else if (path.startsWith('/assess')) {
      loadStatAndAnalysisData();
    } else if (path.startsWith('/profile')) {
      loadProfileData();
    } else if (path.startsWith('/practice') && questionList.length === 0) {
      loadQuestionList();
    }
  }, [location.pathname]);

  useEffect(() => {
    (async () => {
      const token = getToken();
      const tasks: Promise<void>[] = [];
      if (location.pathname.startsWith('/practice')) {
        tasks.push(loadQuestionList());
      }
      if (token) {
        tasks.push(
          userApi.getMe().then(res => {
            if (res.code === 0) setCurrentUser(res.data);
            else handleLocalClear();
          }).catch(() => handleLocalClear())
        );
      }
      await Promise.all(tasks);
    })();
  }, []);

  useEffect(() => {
    const handleAuthError = () => {
      setAuthMode('login');
      setIsLoginModalOpen(true);
    };
    window.addEventListener('auth:unauthorized', handleAuthError);
    return () => window.removeEventListener('auth:unauthorized', handleAuthError);
  }, []);

  const ensureAuth = (action: () => void, warningMsg = '请先登录系统后再继续操作') => {
    if (getToken()) {
      action();
    } else {
      setPendingAction(() => action);
      setAuthMode('login');
      setIsLoginModalOpen(true);
      toast.warning(warningMsg);
    }
  };

  const onLoginFinish = async (values: Record<string, unknown>) => {
    try {
      const res = await userApi.login(values);
      if (res.code === 0 && res.data) {
        setLocalToken(res.data.tokenValue);
        setCurrentUser({
          userId: res.data.userId,
          username: res.data.username,
          nickname: res.data.nickname,
          avatarUrl: res.data.avatarUrl
        });
        setIsLoginModalOpen(false);
        toast.success(`登录成功 · 欢迎回来，${res.data.nickname}`);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        } else {
          loadQuestionList();
          loadProfileData();
        }
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const onRegisterFinish = async (values: Record<string, unknown>) => {
    try {
      const res = await userApi.register(values);
      if (res.code === 0) {
        toast.success('注册成功，请使用填写的账号密码登录');
        setAuthMode('login');
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await userApi.logout();
      if (res.code === 0) {
        handleLocalClear();
        toast.success('已退出，您已成功退出登录');
        navigate('/practice');
        window.location.reload();
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleProfileUpdated = (patch: Partial<UserVO>) => {
    setCurrentUser(prev => prev ? { ...prev, ...patch } : prev);
    setProfileData(prev => prev ? { ...prev, userProfile: { ...prev.userProfile, ...patch } } : prev);
  };

  const proceedLoadQuestionDetail = async (qId: string, isReadOnly = false) => {
    if (question && question.id === qId) {
      // If we are switching modes (readOnly state on pageStorage), or the current question options/details are not complete, allow loading.
      // But if it's already completely loaded and matches qId, skip to avoid infinite loop.
      return;
    }
    if (!checkUnsavedChanges()) return;
    setLoadingKey('question');
    setPageError('');
    try {
      const res = await questionApi.getDetail(qId);
      if (res.code === 0 && res.data) {
        setQuestion(res.data);
        setSelectedOption('');
        setSubmitResult(null);
        if (!isReadOnly) {
          pageStorage.setActiveQuestionId(qId);
        } else {
          pageStorage.setActiveQuestionId(null);
        }
      }
      else setPageError(res.message || '题目详情加载失败');
    } catch (err: unknown) {
      console.error(err);
      setPageError('题目详情加载失败，请稍后重试');
    } finally {
      setLoadingKey(null);
    }
  };

  const submitAnswer = async () => {
    if (!getToken()) {
      setAuthMode('login');
      setIsLoginModalOpen(true);
      toast.warning('请先登录系统后再提交答案');
      return;
    }
    if (!question) return;
    if (!selectedOption) {
      toast.warning('请选择一个选项后再提交');
      return;
    }
    try {
      const res = await submitApi.submitAnswer({
        questionId: question.id,
        selectedOptionLabel: selectedOption,
        submitToken: submitToken
      });
      if (res.code === 0 && res.data) {
        setSubmitResult(res.data);
        setSubmitToken(() => 'token-ts-' + Date.now());


        const currentQueueBackup = [...activePracticeQueue];
        await loadWrongData(true);
        await loadHistoryData(true);
        await loadStatAndAnalysisData(true);
        setActivePracticeQueue(currentQueueBackup);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleMenuClick = (e: { key: string }) => {
    if (!checkUnsavedChanges()) return;

    const switchTab = () => {
      setQuestion(null); 
      setActivePracticeQueue([]);
      setActiveSubmitId(null);
      setActiveHistoryQueue([]);
      pageStorage.clearPracticeState();
      navigate('/' + e.key);
    };
    
    if (e.key !== 'practice' && !e.key.startsWith('admin-')) {
      ensureAuth(switchTab, '请先登录系统后再查看该功能');
    } else {
      switchTab();
    }
  };

  const handleQuestionLink = (qId: string, categoryName?: string) => {
    const isFromHistory = location.pathname.startsWith('/history');
    if (!isFromHistory) {
      ensureAuth(() => {
        if (categoryName) {
          navigate(`/practice/${categoryName}/play/${qId}`);
        } else {
          navigate(`/practice/play/${qId}`);
        }
      }, '请先登录系统后再开始做题');
    } else {
      navigate(`/history/play/${qId}`);
    }
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const handleStartPracticeCategory = (categoryName: string, sortedQuestionIds: string[]) => {
    if (sortedQuestionIds.length === 0) return;
    const uniqueIds = [...new Set(sortedQuestionIds)];
    const idxMap: Record<string, number> = {};
    sortedQuestionIds.forEach((id, i) => { idxMap[id] = i + 1; });
    setQuestionIdxMap(idxMap);
    const shuffled = shuffleArray(uniqueIds);
    const selected = shuffled.slice(0, 30);
    setActivePracticeQueue(selected);
    navigate(`/practice/${categoryName}/play/${selected[0]}`);
    toast.success(`开始练习 · 题库 [${categoryName}] · 共 ${selected.length} 道题`);
  };

  const handleHistoryReview = (record: UserSubmitVO, submitIds: string[]) => {
    if (!checkUnsavedChanges()) return;
    setActiveSubmitId(record.submitId);
    setActiveHistoryQueue(submitIds);
    setActivePracticeQueue([]);
    navigate(`/history/play/${record.questionId}`);
  };

  const handleHistorySubmitNav = (submitId: string) => {
    const record = historyData.find(item => item.submitId === submitId);
    if (!record) return;

    // Check if question details need to be loaded (if navigating to a different question)
    if (question && question.id !== record.questionId) {
      setQuestion(null); // Clear first to allow the wrapper's useEffect to reload
    }

    handleHistoryReview(record, activeHistoryQueue.length > 0 ? activeHistoryQueue : historyData.map(item => item.submitId));
  };

  const handleReviewWrongCategory = async (category: string) => {
    if (!checkUnsavedChanges()) return;
    setQuestion(null);
    setActivePracticeQueue([]);
    navigate(`/wrong/${category}`);
    await loadWrongData();
  };

  const retryCurrentPage = () => {
    const path = location.pathname;
    if (path.startsWith('/practice')) loadQuestionList();
    if (path.startsWith('/history')) loadHistoryData();
    if (path.startsWith('/wrong')) loadWrongData();
    if (path.startsWith('/assess')) loadStatAndAnalysisData();
    if (path.startsWith('/profile')) loadProfileData();
  };

  const renderPageState = (children: ReactNode) => {
    if (loadingKey && loadingKey !== 'question') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
          <div className="spinner" />
          <span style={{ marginLeft: 12, color: colors.gray500 }}>正在加载...</span>
        </div>
      );
    }
    if (pageError) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: colors.gray100, borderRadius: 12, maxWidth: 500, margin: 'auto' }}>
          <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.3 }}>!</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.gray800, marginBottom: 4 }}>加载失败</div>
          <div style={{ fontSize: 14, color: colors.gray500, marginBottom: 20 }}>{pageError}</div>
          <button
            onClick={retryCurrentPage}
            style={{
              padding: '8px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: colors.primary, color: '#fff', fontSize: 14, fontWeight: 600,
            }}
          >
            重新加载
          </button>
        </div>
      );
    }
    return children;
  };

  const getSelectedMenuKey = () => {
    const path = location.pathname;
    if (path.startsWith('/practice')) return 'practice';
    if (path.startsWith('/history')) return 'history';
    if (path.startsWith('/wrong')) return 'wrong';
    if (path.startsWith('/assess')) return 'assess';
    if (path.startsWith('/analysis')) return 'assess';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/admin-users')) return 'admin-users';
    if (path.startsWith('/admin-questions')) return 'admin-questions';
    return 'practice';
  };

  return (
    <ConfigProvider locale={antdLocale ?? undefined} theme={getAntdTheme(colors, theme === 'dark')}>
      <MainLayout
        currentUser={currentUser}
        selectedMenuKey={getSelectedMenuKey()}
        authModalOpen={isLoginModalOpen}
        authModalMode={authMode}
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
        onAuthModeChange={(mode) => { setAuthMode(mode); setIsLoginModalOpen(true); }}
        onAuthModalCancel={() => setIsLoginModalOpen(false)}
        onLoginFinish={onLoginFinish}
        onRegisterFinish={onRegisterFinish}
      >
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/practice" replace />} />
            
            <Route path="/practice" element={renderPageState(
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <QuestionBankList 
                  questionList={questionList}
                  onSelectCategory={(category) => navigate(`/practice/${category}`)}
                />
              </div>
            )} />
            <Route path="/practice/:category" element={renderPageState(
              <CategoryDetailWrapper
                questionList={questionList}
                onGoToDetail={handleQuestionLink}
                onStartPracticeCategory={handleStartPracticeCategory}
              />
            )} />
            <Route path="/practice/:category/play/:questionId" element={renderPageState(
              <CategoryPlayWrapper
                loadingKey={loadingKey}
                question={question}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                submitResult={submitResult}
                onSubmit={submitAnswer}
                getPrevAndNextId={getPrevAndNextId}
                handleQuestionLink={handleQuestionLink}
                proceedLoadQuestionDetail={proceedLoadQuestionDetail}
                checkUnsavedChanges={checkUnsavedChanges}
              />
            )} />
            <Route path="/practice/play/:questionId" element={renderPageState(
              <CategoryPlayWrapper
                loadingKey={loadingKey}
                question={question}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                submitResult={submitResult}
                onSubmit={submitAnswer}
                getPrevAndNextId={getPrevAndNextId}
                handleQuestionLink={handleQuestionLink}
                proceedLoadQuestionDetail={proceedLoadQuestionDetail}
                checkUnsavedChanges={checkUnsavedChanges}
              />
            )} />

            <Route path="/history" element={renderPageState(
              <HistoryList data={historyData} questionList={questionList} onReview={handleHistoryReview} />
            )} />
            <Route path="/history/play/:questionId" element={renderPageState(
              <HistoryPlayWrapper
                loadingKey={loadingKey}
                question={question}
                historyData={historyData}
                setActiveSubmitId={setActiveSubmitId}
                setActiveHistoryQueue={setActiveHistoryQueue}
                prevSubmitId={prevSubmitId}
                nextSubmitId={nextSubmitId}
                handleHistorySubmitNav={handleHistorySubmitNav}
                proceedLoadQuestionDetail={proceedLoadQuestionDetail}
                checkUnsavedChanges={checkUnsavedChanges}
              />
            )} />

            <Route path="/wrong" element={renderPageState(
              <WrongBookWrapper
                wrongData={wrongData}
                setActivePracticeQueue={setActivePracticeQueue}
              />
            )} />
            <Route path="/wrong/:category" element={renderPageState(
              <WrongBookWrapper
                wrongData={wrongData}
                setActivePracticeQueue={setActivePracticeQueue}
              />
            )} />
            <Route path="/wrong/play/:questionId" element={renderPageState(
              <WrongPlayWrapper
                loadingKey={loadingKey}
                question={question}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                submitResult={submitResult}
                onSubmit={submitAnswer}
                getPrevAndNextId={getPrevAndNextId}
                proceedLoadQuestionDetail={proceedLoadQuestionDetail}
                checkUnsavedChanges={checkUnsavedChanges}
                wrongData={wrongData}
                setActivePracticeQueue={setActivePracticeQueue}
              />
            )} />

            <Route path="/assess" element={renderPageState(
              <AnalysisDashboard statData={statData} analysisData={analysisData} onReviewWrongCategory={handleReviewWrongCategory} />
            )} />
            <Route path="/analysis" element={<Navigate to="/assess" replace />} />

            <Route path="/profile" element={renderPageState(
              <ProfilePage
                currentUser={currentUser}
                profileData={profileData}
                calendarData={calendarData}
                onProfileUpdated={handleProfileUpdated}
              />
            )} />

            <Route path="/admin-users" element={
              currentUser?.userRole === 1 ? (
                <AdminUserList />
              ) : (
                <Navigate to="/practice" replace />
              )
            } />

            <Route path="/admin-questions" element={
              currentUser?.userRole === 1 ? (
                <AdminQuestionList />
              ) : (
                <Navigate to="/practice" replace />
              )
            } />
          </Routes>
        </Suspense>
      </MainLayout>
    </ConfigProvider>
  );
}

export default App;
