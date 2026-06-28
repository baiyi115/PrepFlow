import React, { useMemo, useState } from 'react';
import { Avatar, Button, Col, Form, Input, Modal, Row, Space, Table, Upload, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { userApi } from '../api';
import type { CalendarItemVO, UserProfileVO, UserSubmitVO, UserVO } from '../types';
import { useColors } from '../context/themeHooks';

interface Props {
  currentUser: UserVO | null;
  profileData: UserProfileVO | null;
  calendarData: CalendarItemVO[];
  onProfileUpdated: (patch: Partial<UserVO>) => void;
}

export const ProfilePage: React.FC<Props> = ({ currentUser, profileData, calendarData, onProfileUpdated }) => {
  const colors = useColors();
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
  const calendarCountMap = useMemo(() => new Map(calendarData.map(item => [item.date, item.count])), [calendarData]);

  const renderAvatar = (size: number) => {
    if (avatarUrl) {
      return (
        <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 0 1px ${colors.ringSubtle}` }}>
          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      );
    }
    return (
      <Avatar size={size} style={{ background: colors.primary, fontSize: size * 0.4, fontWeight: 700, color: '#fff' }}>
        {displayName.substring(0, 1).toUpperCase()}
      </Avatar>
    );
  };

  const lastThirtyDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - index));
      const key = date.toISOString().slice(0, 10);
      const count = calendarCountMap.get(key) ?? 0;
      return { key, count, label: `${date.getMonth() + 1}/${date.getDate()}` };
    });
  }, [calendarCountMap]);

  const heatBg = (count: number) => {
    if (count <= 0) return 'transparent';
    if (count === 1) return colors.primaryBg;
    if (count <= 3) return colors.primaryBorder;
    return colors.primary;
  };

  const handleProfileSave = async (values: { nickname?: string }) => {
    const nickname = values.nickname?.trim();
    if (!nickname) { message.warning('昵称不能为空'); return; }
    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ nickname });
      if (res.code === 0) {
        onProfileUpdated({ nickname });
        setIsEditOpen(false);
        message.success('个人资料已保存');
      }
    } finally { setSavingProfile(false); }
  };

  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { message.warning('请选择图片文件'); return false; }
    if (file.size > 5 * 1024 * 1024) { message.warning('头像图片不能超过 5MB'); return false; }
    setUploadingAvatar(true);
    try {
      const uploadRes = await userApi.uploadAvatar(file);
      if (uploadRes.code === 0) {
        onProfileUpdated({ avatarUrl: uploadRes.data });
        message.success('头像已保存');
      }
    } finally { setUploadingAvatar(false); }
    return false;
  };

  const columns: ColumnsType<UserSubmitVO> = [
    { title: '题目', dataIndex: 'questionId', key: 'questionId', render: (val: number, record) => record.questionTitle || `题目 ${val}` },
    { title: '选择', dataIndex: 'selectedOptionLabel', key: 'selectedOptionLabel', width: 80 },
    {
      title: '结果', dataIndex: 'isCorrect', key: 'isCorrect', width: 80,
      render: (val: number) => (
        <span style={{ color: val === 1 ? colors.successHover : colors.errorHover, fontWeight: 600, fontSize: 13 }}>
          {val === 1 ? '正确' : '错误'}
        </span>
      )
    },
    { title: '时间', dataIndex: 'createTime', key: 'createTime', render: (val: string) => val.replace('T', ' ') }
  ];

  const profileCards = [
    { label: '累计答题', value: totalCount, color: colors.gray900, bg: colors.surface },
    { label: '答对', value: correctCount, color: colors.success, bg: colors.successBg },
    { label: '答错', value: wrongCount, color: colors.error, bg: colors.errorBg },
    { label: '待复习', value: activeWrongCount, color: colors.primary, bg: colors.primaryBg },
  ];

  return (
    <div className="page-stack">
      <div className="profile-hero">
        {renderAvatar(76)}
        <div className="profile-hero-main">
          <h1 className="profile-name">{displayName}</h1>
          <p className="profile-subtitle">持续练习，沉淀面试能力曲线。</p>
          <Button size="small" onClick={() => setIsEditOpen(true)}>编辑个人资料</Button>
        </div>
        <div className="profile-rate">
          <div style={{ position: 'relative', display: 'inline-block', width: 72, height: 72 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke={colors.gray200} strokeWidth="5" />
              <circle cx="36" cy="36" r="30" fill="none" stroke={colors.primary} strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - Math.min(correctRate, 100) / 100)}`}
                strokeLinecap="round" transform="rotate(-90 36 36)" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: colors.primary, fontVariantNumeric: 'tabular-nums' }}>{correctRate}%</div>
            </div>
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: colors.gray500 }}>正确率</div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {profileCards.map(card => (
          <Col key={card.label} xs={12} sm={6}>
            <div className="profile-stat-card" style={{ background: card.bg }}>
              <div className="metric-label" style={{ color: card.color }}>{card.label}</div>
              <div className="metric-value" style={{ color: card.color }}>{card.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      <section>
        <h2 className="section-title">近 30 天练习日历</h2>
        <div className="calendar-panel">
          <div className="calendar-row">
            {lastThirtyDays.map(item => (
              <div key={item.key} title={`${item.key}：${item.count} 次`} className="calendar-item">
                <div className="calendar-day-cell" style={{
                  background: heatBg(item.count),
                  boxShadow: item.count === 0 ? `0 0 0 1px ${colors.gray300}` : undefined,
                }} />
                <div className="calendar-label">{item.label}</div>
              </div>
            ))}
          </div>
          {calendarData.length === 0 && <div className="calendar-empty-note">暂无练习记录</div>}
        </div>
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <div className="content-card" style={{ height: '100%' }}>
            <h2 className="section-title">分类表现</h2>
            {profileStats.length === 0 ? (
              <div className="empty-state-text" style={{ textAlign: 'center', padding: '30px 20px' }}>暂无分类表现</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profileStats.map(item => {
                  const rate = Number.parseFloat(item.correctRate).toFixed(1);
                  const n = Number(rate);
                  const levelColor = n >= 70 ? colors.success : n >= 50 ? colors.primary : colors.error;
                  return (
                    <div key={item.category} className="performance-item">
                      <div className="performance-body">
                        <div className="performance-head">
                          <span className="performance-name">
                            <span className="performance-dot" style={{ background: levelColor }} />
                            <span style={{ color: colors.gray800 }}>{item.category}</span>
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 16, color: levelColor }}>{rate}%</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: colors.gray500 }}>共 {item.totalCount} 题</span>
                          <span style={{ fontSize: 12, color: colors.success }}>正确 {item.correctCount}</span>
                          <span style={{ fontSize: 12, color: colors.error }}>错误 {item.wrongCount}</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${rate}%`, background: levelColor }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className="content-card" style={{ height: '100%' }}>
            <h2 className="section-title">薄弱分类</h2>
            {profileWeaknesses.filter(item => item.level === '薄弱').length === 0 ? (
              <div className="empty-state-text" style={{ textAlign: 'center', padding: '30px 20px' }}>暂无明显薄弱分类</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profileWeaknesses.filter(item => item.level === '薄弱').map(item => (
                  <span key={item.category} className="weakness-pill" style={{ background: colors.errorBg, color: colors.errorHover }}>
                    {item.category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>

      <section className="content-card">
        <h2 className="section-title">最近答题记录</h2>
        {recentSubmits.length === 0 ? (
          <div className="empty-state-text" style={{ textAlign: 'center', padding: '30px 20px' }}>暂无答题记录</div>
        ) : (
          <div className="table-surface">
            <Table dataSource={recentSubmits} columns={columns} rowKey="submitId" pagination={false} size="small" />
          </div>
        )}
      </section>

      <Modal title="编辑个人资料" open={isEditOpen} onCancel={() => setIsEditOpen(false)} footer={null} destroyOnHidden centered>
        <Form layout="vertical" onFinish={handleProfileSave} initialValues={{ nickname: displayName }}>
          <Form.Item label="头像">
            <Space align="center">
              {renderAvatar(64)}
              <Upload showUploadList={false} beforeUpload={handleAvatarFile} accept="image/*">
                <Button loading={uploadingAvatar}>上传头像</Button>
              </Upload>
            </Space>
            <div style={{ marginTop: 8, fontSize: 12, color: colors.gray500 }}>支持 jpg、png、gif，图片不超过 5MB</div>
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
