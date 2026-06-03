import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Layout, Menu, Button, Space, Card, notification, message, Typography, Spin, Result, ConfigProvider } from 'antd';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import type { UserVO, QuestionVO, QuestionDetailVO, SubmitAnswerVO, UserSubmitVO, GroupedWrongBookVO, CategoryStatVO, WeaknessAnalysisVO, UserProfileVO, CalendarItemVO } from './types';
import { userApi, questionApi, submitApi } from './api';
import { getToken, setToken as setLocalToken, removeToken } from './utils/request';
import { pageStorage } from './utils/pageStorage';
import './App.css';

import { QuestionBankList } from './components/QuestionBankList';
import { QuestionBankDetail } from './components/QuestionBankDetail';
import { QuestionPlay } from './components/QuestionPlay';
import { QuestionReview } from './components/QuestionReview';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { HistoryList } from './components/HistoryList';
import { WrongBook } from './components/WrongBook';
import { ProfilePage } from './components/ProfilePage';
import { AuthModal } from './components/AuthModal';
import type { AuthMode } from './components/AuthModal';

import { AdminUserList } from './components/AdminUserList';
import { AdminQuestionList } from './components/AdminQuestionList';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

function App() {
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

  const getPrevAndNextId = (categoryFromUrl?: string) => {
    if (activePracticeQueue.length > 0 && question) {
      const qIdx = activePracticeQueue.indexOf(question.id);
      if (qIdx !== -1) {
        return {
          prevId: qIdx > 0 ? activePracticeQueue[qIdx - 1] : null,
          nextId: qIdx < activePracticeQueue.length - 1 ? activePracticeQueue[qIdx + 1] : null
        };
      }
    }
    if (categoryFromUrl && question) {
      const categoryQuestions = questionList.filter(q => (q.category || '其它未分类') === categoryFromUrl);
      const currentIdx = categoryQuestions.findIndex(q => q.id === question.id);
      return {
        prevId: currentIdx > 0 ? categoryQuestions[currentIdx - 1].id : null,
        nextId: currentIdx >= 0 && currentIdx < categoryQuestions.length - 1 ? categoryQuestions[currentIdx + 1].id : null
      };
    }
    const currentIdx = questionList.findIndex(q => q.id === question?.id);
    return {
      prevId: currentIdx > 0 ? questionList[currentIdx - 1].id : null,
      nextId: currentIdx >= 0 && currentIdx < questionList.length - 1 ? questionList[currentIdx + 1].id : null
    };
  };

  const activeHistoryRecord = activeSubmitId ? historyData.find(item => item.submitId === activeSubmitId) || null : null;
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
    const init = async () => {
      const path = location.pathname;
      if (path.startsWith('/practice')) {
        if (questionList.length === 0) {
          await loadQuestionList();
        }
      } else if (path.startsWith('/history')) {
        await loadHistoryData();
      } else if (path.startsWith('/wrong')) {
        await loadWrongData();
      } else if (path.startsWith('/assess')) {
        await loadStatAndAnalysisData();
      } else if (path.startsWith('/profile')) {
        await loadProfileData();
      }
    };
    init();
  }, [location.pathname, questionList.length]);

  useEffect(() => {
    const init = async () => {
      await loadQuestionList();

      if (getToken()) {
        try {
          const res = await userApi.getMe();
          if (res.code === 0) {
            setCurrentUser(res.data);
            const path = window.location.pathname;
            if (path.startsWith('/history')) await loadHistoryData();
            if (path.startsWith('/wrong')) await loadWrongData();
            if (path.startsWith('/assess')) await loadStatAndAnalysisData();
            if (path.startsWith('/profile')) await loadProfileData();
          } else {
            handleLocalClear();
          }
        } catch {
          handleLocalClear();
        }
      }
    };
    init();
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
      message.warning(warningMsg);
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
        notification.success({ message: '登录成功', description: `欢迎回来，${res.data.nickname}！已为您载入系统。` });
        
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
        notification.success({ message: '注册成功', description: '您已成功注册账号，请使用刚才填写的账号密码进行登录！' });
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
        notification.info({ message: '安全登出', description: '您已成功退出登录，Token 已销毁。' });
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
      message.warning('请先登录系统后再提交答案');
      return;
    }
    if (!question) return;
    if (!selectedOption) {
      message.warning('请选择一个选项后再提交');
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
        notification.success({ message: '答案提交成功', description: res.data.isCorrect === 1 ? '回答正确！' : '回答错误，请查阅解析。' });
        
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

  const handleStartPracticeCategory = (categoryName: string, sortedQuestionIds: string[]) => {
    if (sortedQuestionIds.length === 0) return;
    setActivePracticeQueue(sortedQuestionIds);
    navigate(`/practice/${categoryName}/play/${sortedQuestionIds[0]}`);
    notification.success({
      message: '开始分类练习',
      description: `已为您开启题库 [${categoryName}] 顺序刷题，共 ${sortedQuestionIds.length} 道题。`
    });
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
        <div className="page-loading-center">
          <Spin description="正在加载..." />
        </div>
      );
    }
    if (pageError) {
      return (
        <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
          <Card className="custom-card" style={{ maxWidth: 500, width: '100%', textAlign: 'center', padding: '24px 16px' }}>
            <Result
              status="error"
              title="加载失败"
              subTitle={pageError}
              extra={[
                <Button type="primary" key="retry" onClick={retryCurrentPage}>
                  重新加载
                </Button>
              ]}
            />
          </Card>
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
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/admin-users')) return 'admin-users';
    if (path.startsWith('/admin-questions')) return 'admin-questions';
    return 'practice';
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ height: '100vh' }}>
        <Sider width={260} style={{ background: '#001529' }}>
          <div className="app-logo" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 'bold', gap: 8, borderBottom: '1px solid #334155' }}>
            <span>面试刷题评估系统</span>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getSelectedMenuKey()]}
            onClick={handleMenuClick}
            items={[
              { key: 'practice', label: '题库大厅' },
              { key: 'history', label: '答题历史' },
              { key: 'wrong', label: '错题本复盘' },
              { key: 'assess', label: '能力评估分析' },
              { key: 'profile', label: '个人主页' },
              ...(currentUser?.userRole === 1 ? [
                { type: 'divider' as const },
                { key: 'admin-users', label: '用户管理 (Admin)' },
                { key: 'admin-questions', label: '题库管理 (Admin)' }
              ] : [])
            ]}
          />
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #d0d7de' }}>
            <Title level={4} style={{ margin: 0 }}>
              {location.pathname.startsWith('/practice') && '题库专区'}
              {location.pathname.startsWith('/history') && '答题历史'}
              {location.pathname.startsWith('/wrong') && '错题本复盘'}
              {location.pathname.startsWith('/assess') && '能力评估分析'}
              {location.pathname.startsWith('/profile') && '个人主页'}
              {location.pathname.startsWith('/admin-users') && '系统管理：用户清单与封禁'}
              {location.pathname.startsWith('/admin-questions') && '系统管理：题库维护'}
            </Title>
            <div className="user-status">
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: currentUser.avatarUrl ? '#fff' : '#1677ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, overflow: 'hidden', border: currentUser.avatarUrl ? '1px solid #e2e8f0' : 'none' }}>
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (currentUser.nickname || currentUser.username).substring(0, 1).toUpperCase()
                    )}
                  </div>
                  <Text strong>{currentUser.nickname}</Text>
                  <Button type="primary" danger size="small" onClick={handleLogout}>登出</Button>
                </div>
              ) : (
                <Button type="primary" onClick={() => {
                  setAuthMode('login');
                  setIsLoginModalOpen(true);
                }}>登录系统</Button>
              )}
            </div>
          </Header>
          
          <Content style={{ padding: '30px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/practice" replace />} />
              
              {/* 题库专区细分路由 */}
              <Route path="/practice" element={renderPageState(
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <QuestionBankList 
                    questionList={questionList}
                    onSelectCategory={(category) => navigate(`/practice/${category}`)}
                  />
                </Space>
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

              {/* 答题历史细分路由 */}
              <Route path="/history" element={renderPageState(
                <HistoryList data={historyData} questionList={questionList} onReview={handleHistoryReview} />
              )} />
              <Route path="/history/play/:questionId" element={renderPageState(
                <HistoryPlayWrapper
                  loadingKey={loadingKey}
                  question={question}
                  activeHistoryRecord={activeHistoryRecord}
                  prevSubmitId={prevSubmitId}
                  nextSubmitId={nextSubmitId}
                  handleHistorySubmitNav={handleHistorySubmitNav}
                  proceedLoadQuestionDetail={proceedLoadQuestionDetail}
                  checkUnsavedChanges={checkUnsavedChanges}
                />
              )} />

              {/* 错题本细分路由 */}
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
                />
              )} />

              <Route path="/assess" element={renderPageState(
                <AnalysisDashboard statData={statData} analysisData={analysisData} onReviewWrongCategory={handleReviewWrongCategory} />
              )} />

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
          </Content>
        </Layout>

        <AuthModal
          open={isLoginModalOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onCancel={() => setIsLoginModalOpen(false)}
          onLogin={onLoginFinish}
          onRegister={onRegisterFinish}
        />
      </Layout>
    </ConfigProvider>
  );
}

// 静态化的子组件（声明在 App 外部以避免 render 重构警告）

interface CategoryDetailWrapperProps {
  questionList: QuestionVO[];
  onGoToDetail: (qId: string, categoryName?: string) => void;
  onStartPracticeCategory: (categoryName: string, sortedQuestionIds: string[]) => void;
}

function CategoryDetailWrapper({ questionList, onGoToDetail, onStartPracticeCategory }: CategoryDetailWrapperProps) {
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

interface CategoryPlayWrapperProps {
  loadingKey: string | null;
  question: QuestionDetailVO | null;
  selectedOption: string;
  onSelectOption: (opt: string) => void;
  submitResult: SubmitAnswerVO | null;
  onSubmit: () => void;
  getPrevAndNextId: (categoryFromUrl?: string) => { prevId: string | null; nextId: string | null };
  handleQuestionLink: (qId: string, categoryName?: string) => void;
  proceedLoadQuestionDetail: (qId: string, isReadOnly?: boolean) => Promise<void>;
  checkUnsavedChanges: () => boolean;
}

function CategoryPlayWrapper({
  loadingKey,
  question,
  selectedOption,
  onSelectOption,
  submitResult,
  onSubmit,
  getPrevAndNextId,
  handleQuestionLink,
  proceedLoadQuestionDetail,
  checkUnsavedChanges
}: CategoryPlayWrapperProps) {
  const { category, questionId } = useParams<{ category?: string; questionId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (questionId) {
      proceedLoadQuestionDetail(questionId, false);
    }
  }, [questionId, proceedLoadQuestionDetail]);

  const { prevId, nextId } = getPrevAndNextId(category);

  const handleBack = () => {
    if (!checkUnsavedChanges()) return;
    pageStorage.setActiveQuestionId(null);
    if (category) {
      navigate(`/practice/${category}`);
    } else {
      navigate('/practice');
    }
  };

  if (loadingKey === 'question') {
    return (
      <div className="page-loading-center">
        <Spin description="正在加载题目..." />
      </div>
    );
  }

  if (!question) return null;

  return (
    <QuestionPlay
      key={question.id}
      question={question}
      selectedOption={selectedOption}
      onSelectOption={onSelectOption}
      submitResult={submitResult}
      onSubmit={onSubmit}
      onBack={handleBack}
      backText={category ? `返回 ${category} 专题` : '返回题库'}
      prevQuestionId={prevId}
      nextQuestionId={nextId}
      onGoToDetail={(qId) => handleQuestionLink(qId, category)}
    />
  );
}

interface HistoryPlayWrapperProps {
  loadingKey: string | null;
  question: QuestionDetailVO | null;
  activeHistoryRecord: UserSubmitVO | null;
  prevSubmitId: string | null;
  nextSubmitId: string | null;
  handleHistorySubmitNav: (submitId: string) => void;
  proceedLoadQuestionDetail: (qId: string, isReadOnly?: boolean) => Promise<void>;
  checkUnsavedChanges: () => boolean;
}

function HistoryPlayWrapper({
  loadingKey,
  question,
  activeHistoryRecord,
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

  const handleBack = () => {
    if (!checkUnsavedChanges()) return;
    navigate('/history');
  };

  if (loadingKey === 'question') {
    return (
      <div className="page-loading-center">
        <Spin description="正在加载回顾..." />
      </div>
    );
  }

  if (!question) return null;

  return (
    <QuestionReview
      key={`${question.id}-${activeHistoryRecord?.submitId || 'unknown'}`}
      question={question}
      record={activeHistoryRecord}
      onBack={handleBack}
      prevSubmitId={prevSubmitId}
      nextSubmitId={nextSubmitId}
      onGoToSubmit={handleHistorySubmitNav}
    />
  );
}

interface WrongBookWrapperProps {
  wrongData: GroupedWrongBookVO[];
  setActivePracticeQueue: (queue: string[]) => void;
}

function WrongBookWrapper({ wrongData, setActivePracticeQueue }: WrongBookWrapperProps) {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  
  const handleGoToDetail = (qId: string, queueIds?: string[]) => {
    if (queueIds && queueIds.length > 0) {
      setActivePracticeQueue(queueIds);
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

interface WrongPlayWrapperProps {
  loadingKey: string | null;
  question: QuestionDetailVO | null;
  selectedOption: string;
  onSelectOption: (opt: string) => void;
  submitResult: SubmitAnswerVO | null;
  onSubmit: () => void;
  getPrevAndNextId: (categoryFromUrl?: string) => { prevId: string | null; nextId: string | null };
  proceedLoadQuestionDetail: (qId: string, isReadOnly?: boolean) => Promise<void>;
  checkUnsavedChanges: () => boolean;
}

function WrongPlayWrapper({
  loadingKey,
  question,
  selectedOption,
  onSelectOption,
  submitResult,
  onSubmit,
  getPrevAndNextId,
  proceedLoadQuestionDetail,
  checkUnsavedChanges
}: WrongPlayWrapperProps) {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const fromCategory = query.get('from');

  useEffect(() => {
    if (questionId) {
      proceedLoadQuestionDetail(questionId, false);
    }
  }, [questionId, proceedLoadQuestionDetail]);

  const { prevId, nextId } = getPrevAndNextId(fromCategory || undefined);

  const handleBack = () => {
    if (!checkUnsavedChanges()) return;
    pageStorage.setActiveQuestionId(null);
    if (fromCategory) {
      navigate(`/wrong/${fromCategory}`);
    } else {
      navigate('/wrong');
    }
  };

  if (loadingKey === 'question') {
    return (
      <div className="page-loading-center">
        <Spin description="正在加载题目..." />
      </div>
    );
  }

  if (!question) return null;

  return (
    <QuestionPlay
      key={question.id}
      question={question}
      selectedOption={selectedOption}
      onSelectOption={onSelectOption}
      submitResult={submitResult}
      onSubmit={onSubmit}
      onBack={handleBack}
      backText="返回错题列表"
      prevQuestionId={prevId}
      nextQuestionId={nextId}
      onGoToDetail={(qId) => {
        navigate(`/wrong/play/${qId}${fromCategory ? `?from=${fromCategory}` : ''}`);
      }}
    />
  );
}

export default App;
