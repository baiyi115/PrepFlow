import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Spin, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { questionApi, adminApi } from '../api';
import type { QuestionVO } from '../types';
import { useColors } from '../context/themeHooks';
import { AlertTriangle } from 'lucide-react';

const { TextArea } = Input;
const { Option } = Select;

interface AdminQuestionFormValues {
  title: string;
  content: string;
  category: string;
  difficulty: number;
  correctOptionLabel: string;
  analysis: string;
  options: Array<{
    optionLabel: string;
    optionContent: string;
    sortOrder: number;
  }>;
}

export const AdminQuestionList: React.FC = () => {
  const colors = useColors();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const loadQuestions = useCallback(async () => {
    try {
      const res = await questionApi.getList();
      if (res.code === 0) {
        setQuestions(res.data);
        setError('');
      } else {
        setError(res.message || '加载题库失败');
      }
    } catch {
      setError('加载题库失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    await loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadQuestions(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadQuestions]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      difficulty: 1,
      options: [
        { optionLabel: 'A', optionContent: '', sortOrder: 1 },
        { optionLabel: 'B', optionContent: '', sortOrder: 2 },
        { optionLabel: 'C', optionContent: '', sortOrder: 3 },
        { optionLabel: 'D', optionContent: '', sortOrder: 4 }
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (record: QuestionVO) => {
    setModalMode('edit');
    setEditingId(record.id);
    setIsModalOpen(true);
    try {
      const res = await adminApi.getQuestionDetail(record.id);
      if (res.code === 0 && res.data) {
        form.setFieldsValue({
          title: res.data.title,
          content: res.data.content,
          category: res.data.category,
          difficulty: res.data.difficulty,
          correctOptionLabel: res.data.correctOptionLabel,
          analysis: res.data.analysis,
          options: res.data.options.map(opt => ({ optionLabel: opt.optionLabel, optionContent: opt.optionContent, sortOrder: opt.sortOrder }))
        });
      }
    } catch {
      message.error('无法加载题目详细信息');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminApi.deleteQuestion(id);
      if (res.code === 0) {
        message.success('删除成功');
        refreshQuestions();
      } else {
        message.error('删除失败: ' + res.message);
      }
    } catch {
      message.error('系统异常，删除失败');
    }
  };

  const handleModalSubmit = async (values: AdminQuestionFormValues) => {
    setSaving(true);
    try {
      const requestData = {
        title: values.title,
        content: values.content,
        category: values.category,
        difficulty: values.difficulty,
        questionType: 1,
        correctOptionLabel: values.correctOptionLabel,
        analysis: values.analysis || '暂无解析',
        options: values.options.map(opt => ({ optionLabel: opt.optionLabel, optionContent: opt.optionContent, sortOrder: opt.sortOrder }))
      };
      if (modalMode === 'create') {
        const res = await adminApi.addQuestion(requestData);
        if (res.code === 0) {
          message.success('添加成功');
          setIsModalOpen(false);
          refreshQuestions();
        } else {
          message.error('添加失败: ' + res.message);
        }
      } else {
        const res = await adminApi.updateQuestion({ ...requestData, id: editingId });
        if (res.code === 0) {
          message.success('修改成功');
          setIsModalOpen(false);
          refreshQuestions();
        } else {
          message.error('修改失败: ' + res.message);
        }
      }
    } catch {
      message.error('保存异常');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<QuestionVO> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
    { title: '题目名称', dataIndex: 'title', key: 'title' },
    { title: '标签', dataIndex: 'category', key: 'category', width: 150, render: (cat: string) => <Tag color="default">{cat}</Tag> },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (val: number) => {
        if (val === 1) return <Tag color="success">简单</Tag>;
        if (val === 2) return <Tag color="warning">中等</Tag>;
        return <Tag color="error">困难</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" style={{ padding: 0, color: colors.primary }} onClick={() => openEditModal(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" style={{ padding: 0, color: colors.error }}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (error) {
    return (
      <div className="empty-state">
        <AlertTriangle size={48} color={colors.error} style={{ marginBottom: 16 }} />
        <div className="empty-state-title">数据加载失败</div>
        <div className="empty-state-text" style={{ marginBottom: 20 }}>{error}</div>
        <Button type="primary" onClick={refreshQuestions}>重新尝试</Button>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="admin-tabs">
        <button onClick={() => navigate('/admin-users')} className="admin-tab-button">用户管理</button>
        <button onClick={() => navigate('/admin-questions')} className="admin-tab-button is-active">题库管理</button>
      </div>

      <div className="admin-toolbar">
        <h1 className="admin-toolbar-title">题库管理</h1>
        <Button type="primary" onClick={openCreateModal}>+ 新增题目</Button>
      </div>

      <div className="table-surface">
        {loading && questions.length === 0 ? (
          <div className="element-loading-center"><Spin /></div>
        ) : (
          <Table
            dataSource={questions}
            columns={columns}
            rowKey="id"
            size="large"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          />
        )}
      </div>

      <Modal title={modalMode === 'create' ? '新增单选题' : '修改题目'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} destroyOnHidden centered width={800}>
        <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
          <Space align="start" style={{ display: 'flex', width: '100%' }}>
            <Form.Item label="所属分类" name="category" rules={[{ required: true, message: '请输入分类' }]} style={{ flex: 1 }}>
              <Input placeholder="例如：Java、Spring、React" />
            </Form.Item>
            <Form.Item label="难度" name="difficulty" rules={[{ required: true }]} style={{ width: 150 }}>
              <Select><Option value={1}>简单</Option><Option value={2}>中等</Option><Option value={3}>困难</Option></Select>
            </Form.Item>
          </Space>
          <Form.Item label="题目名称" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="例如：Java 中的各种锁" />
          </Form.Item>
          <Form.Item label="补充说明 (可选)" name="content">
            <TextArea rows={3} placeholder="额外的代码段或前置条件..." />
          </Form.Item>

          <div className="form-panel">
            <div style={{ fontWeight: 600, marginBottom: 12, color: colors.gray800 }}>选项配置</div>
            <Form.List name="options">
              {(fields) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'optionLabel']} style={{ width: 56, marginBottom: 0 }}>
                        <Input readOnly style={{ fontWeight: 'bold', textAlign: 'center' }} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'optionContent']} rules={[{ required: true, message: '必填' }]} style={{ flex: 1, width: 450, marginBottom: 0 }}>
                        <Input placeholder="选项内容" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'sortOrder']} hidden><Input /></Form.Item>
                    </Space>
                  ))}
                </>
              )}
            </Form.List>
          </div>

          <Form.Item label="正确答案" name="correctOptionLabel" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="选择正确选项"><Option value="A">A</Option><Option value="B">B</Option><Option value="C">C</Option><Option value="D">D</Option></Select>
          </Form.Item>
          <Form.Item label="解析" name="analysis" rules={[{ required: true, message: '必填' }]}>
            <TextArea rows={4} placeholder="深入解析为什么选这个答案..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 20 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit" loading={saving}>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
