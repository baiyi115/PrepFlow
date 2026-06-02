import React, { useState } from 'react';
import { Avatar, Button, Card, Col, Empty, Form, Input, Modal, Progress, Row, Space, Table, Tag, Typography, Upload, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { userApi } from '../api';
import type { CalendarItemVO, UserProfileVO, UserSubmitVO, UserVO } from '../types';

const { Title, Text } = Typography;

interface Props {
  currentUser: UserVO | null;
  profileData: UserProfileVO | null;
  calendarData: CalendarItemVO[];
  onProfileUpdated: (patch: Partial<UserVO>) => void;
}

export const ProfilePage: React.FC<Props> = ({ currentUser, profileData, calendarData, onProfileUpdated }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const totalCount = profileData?.totalCount ?? 0;
  const correctCount = profileData?.correctCount ?? 0;
  const wrongCount = profileData?.wrongCount ?? 0;
  const correctRate = profileData ? Number(profileData.correctRate) : 0;
  const activeWrongCount = profileData?.activeWrongCount ?? 0;
  const profileStats = profileData?.categoryStats ?? [];
  const profileWeaknesses = profileData?.weaknesses ?? [];
  const recentSubmits = profileData?.recentSubmits ?? [];
  const displayName = currentUser?.nickname || currentUser?.username || '未登录用户';
  const avatarUrl = currentUser?.avatarUrl || undefined;
  const calendarCountMap = new Map(calendarData.map(item => [item.date, item.count]));

  const renderAvatar = (size: number, fontSize: number) => {
    if (avatarUrl) {
      return (
        <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0' }}>
          <img src={avatarUrl} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      );
    }
    return (
      <Avatar size={size} style={{ background: '#3b82f6', fontSize, fontWeight: 700 }}>
        {displayName.substring(0, 1).toUpperCase()}
      </Avatar>
    );
  };

  const today = new Date();
  const lastThirtyDays = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);
    const count = calendarCountMap.get(key) ?? 0;
    return { key, count, label: `${date.getMonth() + 1}/${date.getDate()}` };
  });

  const getHeatColor = (count: number) => {
    if (count <= 0) return '#e2e8f0';
    if (count === 1) return '#bfdbfe';
    if (count <= 3) return '#60a5fa';
    return '#2563eb';
  };

  const handleProfileSave = async (values: { nickname?: string }) => {
    const nickname = values.nickname?.trim();
    if (!nickname) {
      message.warning('昵称不能为空');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ nickname });
      if (res.code === 0) {
        onProfileUpdated({ nickname });
        setIsEditOpen(false);
        message.success('个人资料已保存');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.warning('请选择图片文件');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.warning('头像图片不能超过 5MB');
      return false;
    }
    setUploadingAvatar(true);
    try {
      const uploadRes = await userApi.uploadAvatar(file);
      if (uploadRes.code === 0) {
        onProfileUpdated({ avatarUrl: uploadRes.data });
        message.success('头像已保存');
      }
    } finally {
      setUploadingAvatar(false);
    }
    return false;
  };

  const columns: ColumnsType<UserSubmitVO> = [
    { title: '题目', dataIndex: 'questionId', key: 'questionId', render: (val: number, record) => record.questionTitle || `题目 ${val}` },
    { title: '选择', dataIndex: 'selectedOptionLabel', key: 'selectedOptionLabel', width: 90 },
    {
      title: '结果',
      dataIndex: 'isCorrect',
      key: 'isCorrect',
      width: 90,
      render: (val: number) => val === 1 ? <Tag color="success">正确</Tag> : <Tag color="error">错误</Tag>
    },
    { title: '时间', dataIndex: 'createTime', key: 'createTime', render: (val: string) => val.replace('T', ' ') }
  ];

  return (
    <div className="page-container">
      <Card className="custom-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {renderAvatar(72, 28)}
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ margin: 0 }}>{displayName}</Title>
            <Text type="secondary">持续练习，沉淀自己的面试能力曲线。</Text>
            <div style={{ marginTop: 12 }}>
              <Button size="small" onClick={() => setIsEditOpen(true)}>编辑个人资料</Button>
            </div>
          </div>
          <div style={{ minWidth: 140, textAlign: 'center' }}>
            <Progress type="circle" percent={correctRate} size={92} strokeColor="#3b82f6" />
            <div style={{ marginTop: 8 }}><Text type="secondary">总体正确率</Text></div>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="custom-card">
            <Text className="stat-card-title">累计答题</Text>
            <Title level={3} className="stat-card-value">{totalCount}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="custom-card">
            <Text className="stat-card-title">答对题数</Text>
            <Title level={3} className="stat-card-value" style={{ color: '#0f766e' }}>{correctCount}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="custom-card">
            <Text className="stat-card-title">答错题数</Text>
            <Title level={3} className="stat-card-value" style={{ color: '#dc2626' }}>{wrongCount}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="custom-card">
            <Text className="stat-card-title">待复盘错题</Text>
            <Title level={3} className="stat-card-value" style={{ color: '#3b82f6' }}>{activeWrongCount}</Title>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card className="custom-card" title="近 30 天练习日历">
            {calendarData.length === 0 ? (
              <Empty description="暂无练习记录。完成答题后会生成练习日历。" />
            ) : (
              <div className="calendar-scroll-container">
                <div className="calendar-grid">
                  {lastThirtyDays.map(item => (
                    <div key={item.key} title={`${item.key}：${item.count} 次答题`} className="calendar-day-box">
                      <div className="calendar-heat-cell" style={{ background: getHeatColor(item.count) }} />
                      <Text type="secondary" style={{ fontSize: 10 }}>{item.label}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card className="custom-card" title="分类表现" style={{ height: '100%' }}>
            {profileStats.length === 0 ? (
              <Empty description="暂无分类表现。开始答题后会生成能力曲线。" />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {profileStats.map(item => {
                  const rate = Number.parseFloat(item.correctRate).toFixed(1);
                  return (
                    <div key={item.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text strong>{item.category}</Text>
                        <Text type="secondary">{rate}%</Text>
                      </div>
                      <Progress percent={Number(rate)} showInfo={false} strokeColor="#3b82f6" />
                    </div>
                  );
                })}
              </Space>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card className="custom-card" title="薄弱分类" style={{ height: '100%' }}>
            {profileWeaknesses.filter(item => item.level === '薄弱').length === 0 ? (
              <Empty description="暂无明显薄弱分类。" />
            ) : (
              <Space wrap>
                {profileWeaknesses.filter(item => item.level === '薄弱').map(item => (
                  <Tag color="error" key={item.category}>{item.category}</Tag>
                ))}
              </Space>
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card className="custom-card" title="最近答题记录">
            {recentSubmits.length === 0 ? (
              <Empty description="暂无答题记录。" />
            ) : (
              <Table dataSource={recentSubmits} columns={columns} rowKey="submitId" pagination={false} />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="编辑个人资料"
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        footer={null}
        destroyOnHidden
        centered
      >
        <Form layout="vertical" onFinish={handleProfileSave} initialValues={{ nickname: displayName }}>
          <Form.Item label="头像">
            <Space align="center">
              {renderAvatar(64, 24)}
              <Upload showUploadList={false} beforeUpload={handleAvatarFile} accept="image/*">
                <Button loading={uploadingAvatar}>上传头像</Button>
              </Upload>
            </Space>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">支持 jpg、png、gif，图片大小不超过 5MB。</Text>
            </div>
          </Form.Item>
          <Form.Item label="昵称" name="nickname" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input maxLength={20} placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setIsEditOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit" loading={savingProfile}>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
