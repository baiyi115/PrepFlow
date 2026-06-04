import React, { useState } from 'react';
import { Avatar, Button, Col, Form, Input, Modal, Row, Space, Table, Upload, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { userApi } from '../api';
import type { CalendarItemVO, UserProfileVO, UserSubmitVO, UserVO } from '../types';
import { useColors } from '../context/ThemeContext';

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
  const calendarCountMap = new Map(calendarData.map(item => [item.date, item.count]));

  const renderAvatar = (size: number) => {
    if (avatarUrl) {
      return (
        <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${colors.gray200}` }}>
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

  const today = new Date();
  const lastThirtyDays = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);
    const count = calendarCountMap.get(key) ?? 0;
    return { key, count, label: `${date.getMonth() + 1}/${date.getDate()}` };
  });

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

  return (
    <div>
      <div style={{
        background: `linear-gradient(135deg, ${colors.primaryBg}, ${colors.gray50})`,
        borderRadius: 16, padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        {renderAvatar(76)}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.gray800, letterSpacing: '-0.01em' }}>{displayName}</h1>
          <p style={{ margin: '4px 0 12px', color: colors.gray500, fontSize: 14 }}>持续练习，沉淀面试能力曲线</p>
          <Button size="small" onClick={() => setIsEditOpen(true)} style={{ borderRadius: 8, fontSize: 13 }}>
            编辑个人资料
          </Button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', width: 72, height: 72 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke={colors.gray200} strokeWidth="5" />
              <circle cx="36" cy="36" r="30" fill="none" stroke={colors.primary} strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - Math.min(correctRate, 100) / 100)}`}
                strokeLinecap="round" transform="rotate(-90 36 36)" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: colors.primary }}>{correctRate}%</div>
            </div>
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: colors.gray500 }}>正确率</div>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={6}>
          <div style={{ padding: '20px 22px', borderRadius: 14, border: `1px solid ${colors.gray200}`, background: colors.gray100 }}>
            <div style={{ fontSize: 12, color: colors.gray500, fontWeight: 500, marginBottom: 6 }}>累计答题</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: colors.gray900, lineHeight: 1.1 }}>{totalCount}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ padding: '20px 22px', borderRadius: 14, background: colors.successBg }}>
            <div style={{ fontSize: 12, color: colors.success, fontWeight: 600, opacity: 0.7, marginBottom: 6 }}>答对</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: colors.success, lineHeight: 1.1 }}>{correctCount}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ padding: '20px 22px', borderRadius: 14, background: colors.errorBg }}>
            <div style={{ fontSize: 12, color: colors.error, fontWeight: 600, opacity: 0.7, marginBottom: 6 }}>答错</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: colors.error, lineHeight: 1.1 }}>{wrongCount}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ padding: '20px 22px', borderRadius: 14, background: colors.primaryBg }}>
            <div style={{ fontSize: 12, color: colors.primary, fontWeight: 600, opacity: 0.7, marginBottom: 6 }}>待复盘</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: colors.primary, lineHeight: 1.1 }}>{activeWrongCount}</div>
          </div>
        </Col>
      </Row>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: colors.gray800 }}>近 30 天练习日历</h3>
        {calendarData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: colors.gray100, borderRadius: 12, color: colors.gray500, fontSize: 14 }}>
            暂无练习记录
          </div>
        ) : (
          <div style={{ background: colors.gray100, borderRadius: 12, padding: '18px 20px', border: `1px solid ${colors.gray200}` }}>
            <div style={{ display: 'flex', gap: 4, overflow: 'auto', paddingBottom: 4 }}>
              {lastThirtyDays.map(item => (
                <div key={item.key} title={`${item.key}：${item.count} 次`} style={{ textAlign: 'center', minWidth: 30, flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: heatBg(item.count),
                    border: item.count === 0 ? `1.5px dashed ${colors.gray300}` : '1.5px solid transparent',
                    margin: '0 auto 3px',
                  }} />
                  <div style={{ fontSize: 9, color: colors.gray400, lineHeight: 1.1 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 72 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <div style={{ borderRadius: 14, padding: 22, border: `1px solid ${colors.gray200}`, height: '100%' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: colors.gray800 }}>分类表现</h3>
            {profileStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: colors.gray500, fontSize: 14 }}>暂无分类表现</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profileStats.map(item => {
                  const rate = Number.parseFloat(item.correctRate).toFixed(1);
                  const n = Number(rate);
                  const levelColor = n >= 70 ? colors.success : n >= 50 ? colors.primary : colors.error;
                  return (
                    <div key={item.category} style={{
                      background: colors.gray100, borderRadius: 10, overflow: 'hidden',
                      border: `1px solid ${colors.gray200}`, position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: levelColor,
                      }} />
                      <div style={{ padding: '12px 14px 12px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: colors.gray800 }}>{item.category}</span>
                          <span style={{ fontWeight: 700, fontSize: 16, color: levelColor }}>{rate}%</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: colors.gray500 }}>共 {item.totalCount} 题</span>
                          <span style={{ fontSize: 12, color: colors.success }}>正确 {item.correctCount}</span>
                          <span style={{ fontSize: 12, color: colors.error }}>错误 {item.wrongCount}</span>
                        </div>
                        <div style={{ height: 8, background: colors.gray300, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 4, width: `${rate}%`, background: levelColor }} />
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
          <div style={{ borderRadius: 14, padding: 22, border: `1px solid ${colors.gray200}`, height: '100%' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: colors.gray800 }}>薄弱分类</h3>
            {profileWeaknesses.filter(item => item.level === '薄弱').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: colors.gray500, fontSize: 14 }}>暂无明显薄弱分类</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profileWeaknesses.filter(item => item.level === '薄弱').map(item => (
                  <span key={item.category} style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: colors.errorBg, color: colors.errorHover, fontSize: 13, fontWeight: 500,
                  }}>
                    {item.category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>
      </div>

      <div style={{ marginBottom: 48 }}>
        <Row>
          <Col span={24}>
            <div style={{ borderRadius: 14, padding: 28, border: `1px solid ${colors.gray200}` }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: colors.gray800 }}>最近答题记录</h3>
            {recentSubmits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: colors.gray500, fontSize: 14 }}>暂无答题记录</div>
            ) : (
              <div style={{ background: colors.gray100, borderRadius: 8, overflow: 'hidden', border: `1px solid ${colors.gray200}` }}>
                <Table dataSource={recentSubmits} columns={columns} rowKey="submitId" pagination={false} size="small" />
              </div>
            )}
          </div>
        </Col>
      </Row>
      </div>

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
