import React from 'react';
import { Button, Form, Input, Modal } from 'antd';

import { useColors } from '../context/themeHooks';
export type AuthMode = 'login' | 'register';

interface Props {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onCancel: () => void;
  onLogin: (values: Record<string, unknown>) => void;
  onRegister: (values: Record<string, unknown>) => void;
}

export const AuthModal: React.FC<Props> = ({ open, mode, onModeChange, onCancel, onLogin, onRegister }) => {
  const colors = useColors();
  return (
    <Modal
      title={mode === 'login' ? '验证身份' : '创建新账号'}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      centered
      className="auth-modal"
    >
      {mode === 'login' ? (
        <Form onFinish={onLogin} layout="vertical" className="auth-form">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input autoComplete="username" placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password autoComplete="current-password" placeholder="请输入密码" />
          </Form.Item>
          <div className="auth-switch-row">
            <Button type="link" style={{ padding: 0, color: colors.primary }} onClick={() => onModeChange('register')}>
              还没有账号？立即注册
            </Button>
          </div>
          <Form.Item style={{ marginBottom: 0 }}>
            <div className="auth-actions">
              <Button type="default" onClick={onCancel}>取消</Button>
              <Button type="primary" htmlType="submit">确认登录</Button>
            </div>
          </Form.Item>
        </Form>
      ) : (
        <Form onFinish={onRegister} layout="vertical" className="auth-form">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input autoComplete="username" placeholder="建议使用字母/数字" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password autoComplete="new-password" placeholder="请输入密码" />
          </Form.Item>
          <Form.Item label="昵称" name="nickname" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input autoComplete="nickname" placeholder="您在系统中的昵称" />
          </Form.Item>
          <div className="auth-switch-row">
            <Button type="link" style={{ padding: 0, color: colors.primary }} onClick={() => onModeChange('login')}>
              已有账号？返回登录
            </Button>
          </div>
          <Form.Item style={{ marginBottom: 0 }}>
            <div className="auth-actions">
              <Button type="default" onClick={onCancel}>取消</Button>
              <Button type="primary" htmlType="submit" style={{ background: colors.success, borderColor: colors.success }}>确认注册</Button>
            </div>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
