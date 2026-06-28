import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import type { UserVO } from '../../types';
import type { AuthMode } from '../AuthModal';
import { useTheme } from '../../context/themeHooks';
import { BookOpen, History, BookX, BarChart3, User, Shield, LogOut, LogIn, Sun, Moon } from 'lucide-react';

const AuthModal = lazy(() => import('../AuthModal').then(m => ({ default: m.AuthModal })));

const navItems = [
  { key: 'practice', label: '刷题', icon: BookOpen },
  { key: 'history', label: '历史', icon: History },
  { key: 'wrong', label: '错题', icon: BookX },
  { key: 'assess', label: '分析', icon: BarChart3 },
  { key: 'profile', label: '个人', icon: User },
];

interface MainLayoutProps {
  children: ReactNode;
  currentUser: UserVO | null;
  selectedMenuKey: string;
  authModalOpen: boolean;
  authModalMode: AuthMode;
  onMenuClick: (info: { key: string }) => void;
  onLogout: () => void;
  onAuthModeChange: (mode: AuthMode) => void;
  onAuthModalCancel: () => void;
  onLoginFinish: (values: Record<string, unknown>) => Promise<void>;
  onRegisterFinish: (values: Record<string, unknown>) => Promise<void>;
}

export function MainLayout({
  children,
  currentUser,
  selectedMenuKey,
  authModalOpen,
  authModalMode,
  onMenuClick,
  onLogout,
  onAuthModeChange,
  onAuthModalCancel,
  onLoginFinish,
  onRegisterFinish,
}: MainLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const adminActive = selectedMenuKey === 'admin-users' || selectedMenuKey === 'admin-questions';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-nav-group">
          <nav className="app-nav-group" aria-label="主导航">
            {navItems.map(item => {
              const active = selectedMenuKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onMenuClick({ key: item.key })}
                  className={`app-nav-button${active ? ' is-active' : ''}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              );
            })}
            {currentUser?.userRole === 1 && (
              <>
                <div className="app-admin-divider" />
                <button
                  onClick={() => onMenuClick({ key: 'admin-users' })}
                  className={`app-nav-button${adminActive ? ' is-active' : ''}`}
                >
                  <Shield size={14} />
                  管理
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="app-actions">
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
            aria-label={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
            className="app-icon-button"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {currentUser ? (
            <div className="app-user">
              <div className="app-avatar">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" />
                ) : (
                  <span className="app-avatar-initial">
                    {(currentUser.nickname || currentUser.username).substring(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="app-user-name">{currentUser.nickname}</span>
              <button
                onClick={onLogout}
                className="app-logout-button"
              >
                <LogOut size={14} />
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAuthModeChange('login')}
              className="app-auth-button"
            >
              <LogIn size={14} />
              登录
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {children}
      </main>

      <Suspense>
        <AuthModal
          open={authModalOpen}
          mode={authModalMode}
          onModeChange={onAuthModeChange}
          onCancel={onAuthModalCancel}
          onLogin={onLoginFinish}
          onRegister={onRegisterFinish}
        />
      </Suspense>
    </div>
  );
}
