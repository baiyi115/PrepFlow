import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Switch, Space, message, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../api';
import type { UserVO } from '../types';
import { useColors } from '../context/themeHooks';
import { AlertTriangle } from 'lucide-react';

export const AdminUserList: React.FC = () => {
  const colors = useColors();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const res = await adminApi.listUsers();
      if (res.code === 0) {
        setUsers(res.data);
        setError('');
      } else {
        setError(res.message || '加载用户列表失败');
      }
    } catch {
      setError('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    await loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const handleStatusChange = async (userId: string, checked: boolean) => {
    const newStatus = checked ? 0 : 1;
    const actionText = checked ? '解封' : '封禁';
    try {
      const res = await adminApi.updateUserStatus({ userId, status: newStatus });
      if (res.code === 0) {
        message.success(`用户${actionText}成功`);
        setUsers(prev => prev.map(u => (u.userId === userId ? { ...u, status: newStatus } : u)));
      } else {
        message.error(`用户${actionText}失败: ${res.message}`);
      }
    } catch {
      message.error(`系统异常，用户${actionText}失败`);
    }
  };

  const columns: ColumnsType<UserVO> = [
    {
      title: '用户 ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 220,
      render: (val: string) => <span className="user-id-text" style={{ color: colors.gray600, fontSize: 13 }}>{val}</span>
    },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '身份',
      dataIndex: 'userRole',
      key: 'userRole',
      width: 120,
      render: (role: number) => role === 1 ? <Tag color="purple">管理员</Tag> : <Tag color="blue">普通用户</Tag>
    },
    {
      title: '账号状态',
      key: 'status',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          {record.status === 0 ? <Tag color="success">正常</Tag> : <Tag color="error">封禁</Tag>}
          <Switch
            checkedChildren="正常"
            unCheckedChildren="封禁"
            checked={record.status === 0}
            onChange={(checked) => handleStatusChange(record.userId, checked)}
            disabled={record.userRole === 1}
          />
        </Space>
      )
    }
  ];

  if (error) {
    return (
      <div className="empty-state">
        <AlertTriangle size={48} color={colors.error} style={{ marginBottom: 16 }} />
        <div className="empty-state-title">加载失败</div>
        <div className="empty-state-text" style={{ marginBottom: 20 }}>{error}</div>
        <Button type="primary" onClick={refreshUsers}>重新尝试</Button>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="admin-tabs">
        <button onClick={() => navigate('/admin-users')} className="admin-tab-button is-active">用户管理</button>
        <button onClick={() => navigate('/admin-questions')} className="admin-tab-button">题库管理</button>
      </div>

      <div className="table-surface">
        {loading && users.length === 0 ? (
          <div className="element-loading-center"><Spin /></div>
        ) : (
          <Table
            dataSource={users}
            columns={columns}
            rowKey="userId"
            size="large"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          />
        )}
      </div>
    </div>
  );
};
