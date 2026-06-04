import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Switch, Space, message, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../api';
import type { UserVO } from '../types';
import { useColors } from '../context/ThemeContext';
import { AlertTriangle } from 'lucide-react';

export const AdminUserList: React.FC = () => {
  const colors = useColors();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fetchUsers = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminApi.listUsers();
      if (res.code === 0) setUsers(res.data);
      else setError(res.message || '加载用户列表失败');
    } catch { setError('加载用户列表失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleStatusChange = async (userId: string, checked: boolean) => {
    const newStatus = checked ? 0 : 1;
    const actionText = checked ? '解封' : '封禁';
    try {
      const res = await adminApi.updateUserStatus({ userId, status: newStatus });
      if (res.code === 0) {
        message.success(`用户${actionText}成功`);
        setUsers(prev => prev.map(u => (u.userId === userId ? { ...u, status: newStatus } : u)));
      } else message.error(`用户${actionText}失败: ${res.message}`);
    } catch { message.error(`系统异常，用户${actionText}失败`); }
  };

  const columns: ColumnsType<UserVO> = [
    { title: '用户 ID', dataIndex: 'userId', key: 'userId', width: 220,
      render: (val: string) => <span style={{ color: colors.gray600, fontSize: 13 }}>{val}</span>
    },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '身份', dataIndex: 'userRole', key: 'userRole', width: 120,
      render: (role: number) => role === 1 ? <Tag color="purple" style={{ borderRadius: 6 }}>管理员</Tag> : <Tag color="blue" style={{ borderRadius: 6 }}>普通用户</Tag>
    },
    { title: '账号状态', key: 'status', width: 180,
      render: (_, record) => (
        <Space size="middle">
          {record.status === 0 ? <Tag color="success" style={{ borderRadius: 6 }}>正常</Tag> : <Tag color="error" style={{ borderRadius: 6 }}>封禁</Tag>}
          <Switch checkedChildren="正常" unCheckedChildren="封禁"
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
      <div style={{ textAlign: 'center', padding: '60px 20px', background: colors.gray100, borderRadius: 12 }}>
        <AlertTriangle size={48} color={colors.error} style={{ marginBottom: 16 }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: colors.gray800, marginBottom: 8 }}>加载失败</div>
        <div style={{ color: colors.gray500, marginBottom: 20 }}>{error}</div>
        <Button type="primary" onClick={fetchUsers}>重新尝试</Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/admin-users')} style={{
          padding: '6px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: colors.primary, color: '#fff', fontSize: 14, fontWeight: 600,
        }}>用户管理</button>
        <button onClick={() => navigate('/admin-questions')} style={{
          padding: '6px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'transparent', color: colors.gray600, fontSize: 14,
        }}>题库管理</button>
      </div>

      <div style={{ background: colors.gray100, borderRadius: 12, overflow: 'hidden' }}>
        {loading && users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
        ) : (
          <Table dataSource={users} columns={columns} rowKey="userId" size="large"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          />
        )}
      </div>
    </div>
  );
};
