import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import type { UserVO } from '../../types';
import type { AuthMode } from '../AuthModal';
import { useColors, useTheme } from '../../context/ThemeContext';
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
  const colors = useColors(); const { theme, toggleTheme } = useTheme();
  return (
    <div style={{ minHeight: '100vh', background: colors.gray50 }}>
      <header style={{
        background: theme === 'dark' ? 'rgba(28,25,23,0.85)' : 'rgba(255,255,255,0.48)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        boxShadow: `inset 0 -1px 0 ${colors.gray200}`,
        height: 64,
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {navItems.map(item => {
              const active = selectedMenuKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onMenuClick({ key: item.key })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 20px', borderRadius: 10,
                    border: 'none', cursor: 'pointer',
                    background: active ? colors.primary : 'transparent',
                    color: active ? '#fff' : colors.gray600,
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.01em',
                  }}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              );
            })}
            {currentUser?.userRole === 1 && (
              <>
                <div style={{ width: 1, height: 20, background: colors.gray200, margin: '0 4px' }} />
                <button
                  onClick={() => onMenuClick({ key: 'admin-users' })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 10,
                    border: 'none', cursor: 'pointer',
                    background: selectedMenuKey === 'admin-users' || selectedMenuKey === 'admin-questions' ? colors.primary : 'transparent',
                    color: selectedMenuKey === 'admin-users' || selectedMenuKey === 'admin-questions' ? '#fff' : colors.gray600,
                    fontSize: 13, fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Shield size={14} />
                  管理
                </button>
              </>
            )}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'transparent', color: colors.gray500,
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {currentUser ? (
            <>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: currentUser.avatarUrl ? 'transparent' : colors.primary,
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: currentUser.avatarUrl ? `2px solid ${colors.gray200}` : 'none',
              }}>
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                    {(currentUser.nickname || currentUser.username).substring(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.gray800 }}>{currentUser.nickname}</span>
              <button
                onClick={onLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: 'transparent', color: colors.gray500, fontSize: 13,
                }}
              >
                <LogOut size={14} />
                退出
              </button>
            </>
          ) : (
            <button
              onClick={() => onAuthModeChange('login')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: colors.primary, color: '#fff', fontSize: 14, fontWeight: 600,
              }}
            >
              <LogIn size={14} />
              登录
            </button>
          )}
        </div>
      </header>

      <main style={{ padding: '52px 32px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
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
