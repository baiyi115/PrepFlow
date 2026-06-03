import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Typography, Tag, Switch, Space, message, Spin, Result } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../api';
import type { UserVO } from '../types';

const { Title, Text } = Typography;

export const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<UserVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.listUsers();
      if (res.code === 0) {
        setUsers(res.data);
      } else {
        setError(res.message || '加载用户列表失败');
      }
    } catch (err) {
      console.error(err);
      setError('加载用户列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUsers();
    };
    init();
  }, []);

  const handleStatusChange = async (userId: string, checked: boolean) => {
    const newStatus = checked ? 0 : 1; // true: 正常(0), false: 封禁(1)
    const actionText = checked ? '解封' : '封禁';
    try {
      const res = await adminApi.updateUserStatus({ userId, status: newStatus });
      if (res.code === 0) {
        message.success(`用户${actionText}成功`);
        setUsers(prev => prev.map(u => (u.userId === userId ? { ...u, status: newStatus } : u)));
      } else {
        message.error(`用户${actionText}失败: ` + res.message);
      }
    } catch (err) {
      console.error(err);
      message.error(`系统异常，用户${actionText}失败`);
    }
  };

  const columns: ColumnsType<UserVO> = [
    { 
      title: '用户 ID', 
      dataIndex: 'userId', 
      key: 'userId', 
      width: 220,
      render: (val: string) => <Text className="user-id-text" style={{ color: '#64748b' }}>{val}</Text>
    },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
    { title: '系统昵称', dataIndex: 'nickname', key: 'nickname' },
    { 
      title: '身份权限', 
      dataIndex: 'userRole', 
      key: 'userRole',
      width: 120,
      render: (role: number) => role === 1 
        ? <Tag color="purple">管理员</Tag> 
        : <Tag color="blue">普通用户</Tag>
    },
    {
      title: '账号状态',
      key: 'status',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          {record.status === 0 ? (
            <Tag color="success">正常启用</Tag>
          ) : (
            <Tag color="error">已被封禁</Tag>
          )}
          <Switch
            checkedChildren="正常"
            unCheckedChildren="封禁"
            checked={record.status === 0}
            onChange={(checked) => handleStatusChange(record.userId, checked)}
            disabled={record.userRole === 1} // 保护机制：不能封禁其他管理员
          />
        </Space>
      )
    }
  ];

  if (error) {
    return (
      <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
        <Card className="custom-card" style={{ maxWidth: 450, width: '100%', textAlign: 'center' }}>
          <Result
            status="error"
            title="加载失败"
            subTitle={error}
            extra={<Button type="primary" onClick={fetchUsers}>重新尝试</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Card className="custom-card" style={{ marginBottom: 24 }} styles={{ body: { padding: '16px 24px' } }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>用户管理</Title>
      </Card>

      <Card className="custom-card" styles={{ body: { padding: 0 } }}>
        {loading && users.length === 0 ? (
          <div className="element-loading-center">
            <Spin />
          </div>
        ) : (
          <Table 
            dataSource={users} 
            columns={columns} 
            rowKey="userId" 
            pagination={{ 
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30', '50'],
              onChange: (_, size) => setPageSize(size)
            }} 
            size="large"
          />
        )}
      </Card>
    </div>
  );
};
