import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Typography, Tag, Space, Modal, Form, Input, Select, message, Spin, Result, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { questionApi, adminApi } from '../api';
import type { QuestionVO } from '../types';

const { Title } = Typography;
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
  const [questions, setQuestions] = useState<QuestionVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState(10);

  // 模态框相关
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // 模拟从外部加载，使用 useEffect 执行 fetch
  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await questionApi.getList();
      if (res.code === 0) setQuestions(res.data);
      else setError(res.message || '加载题库失败');
    } catch (err) {
      console.error(err);
      setError('加载题库失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 异步加载
    const init = async () => {
      await fetchQuestions();
    };
    init();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    form.resetFields();
    // 默认提供四个空选项
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
    // 从后端额外拉取详情以获取解析和选项内容
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
          options: res.data.options.map(opt => ({
             optionLabel: opt.optionLabel,
             optionContent: opt.optionContent,
             sortOrder: opt.sortOrder
          }))
        });
      }
    } catch (err) {
      console.error(err);
      message.error("无法加载题目详细信息进行编辑");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminApi.deleteQuestion(id);
      if (res.code === 0) {
        message.success('删除成功');
        fetchQuestions();
      } else {
        message.error('删除失败: ' + res.message);
      }
    } catch (err) {
      console.error(err);
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
        questionType: 1, // 当前系统固定为单选题(1)
        correctOptionLabel: values.correctOptionLabel,
        analysis: values.analysis || '暂无解析',
        options: values.options.map((opt) => ({
          optionLabel: opt.optionLabel,
          optionContent: opt.optionContent,
          sortOrder: opt.sortOrder
        }))
      };

      if (modalMode === 'create') {
        const res = await adminApi.addQuestion(requestData);
        if (res.code === 0) {
          message.success('题目添加成功');
          setIsModalOpen(false);
          fetchQuestions();
        } else {
          message.error('添加失败: ' + res.message);
        }
      } else {
        const res = await adminApi.updateQuestion({ ...requestData, id: editingId });
        if (res.code === 0) {
          message.success('题目修改成功');
          setIsModalOpen(false);
          fetchQuestions();
        } else {
          message.error('修改失败: ' + res.message);
        }
      }
    } catch (err) {
      console.error(err);
      message.error('保存过程中出现异常');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<QuestionVO> = [
    { title: '题目 ID', dataIndex: 'id', key: 'id', width: 90 },
    { title: '题目名称', dataIndex: 'title', key: 'title' },
    { 
      title: '所属标签', 
      dataIndex: 'category', 
      key: 'category',
      width: 150,
      render: (cat: string) => <Tag color="blue">{cat}</Tag>
    },
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
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" style={{ padding: 0 }} onClick={() => openEditModal(record)}>编辑</Button>
          <Popconfirm title="确定要删除这道题吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger style={{ padding: 0 }}>删除</Button>
          </Popconfirm>
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
            title="数据加载失败"
            subTitle={error}
            extra={<Button type="primary" onClick={fetchQuestions}>重新尝试</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Card className="custom-card" style={{ marginBottom: 24 }} styles={{ body: { padding: '16px 24px' } }}>
        <div className="flex-between-wrap">
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>题库管理</Title>
          <Button type="primary" onClick={openCreateModal}>
            + 新增题目
          </Button>
        </div>
      </Card>

      <Card className="custom-card" styles={{ body: { padding: 0 } }}>
        {loading && questions.length === 0 ? (
          <div className="element-loading-center">
            <Spin />
          </div>
        ) : (
          <Table 
            dataSource={questions} 
            columns={columns} 
            rowKey="id" 
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

      {/* 创建与编辑弹窗 */}
      <Modal
        title={modalMode === 'create' ? '新增单选题' : '修改现有题目'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
        centered
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
          <Space align="start" style={{ display: 'flex', width: '100%' }}>
             <Form.Item label="所属知识分类" name="category" rules={[{ required: true, message: '请输入知识分类' }]} style={{ flex: 1 }}>
              <Input placeholder="例如：Java、Spring、React" />
            </Form.Item>
            <Form.Item label="难度级别" name="difficulty" rules={[{ required: true }]} style={{ width: 150 }}>
              <Select>
                <Option value={1}>简单</Option>
                <Option value={2}>中等</Option>
                <Option value={3}>困难</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item label="题目名称" name="title" rules={[{ required: true, message: '请输入题目标题' }]}>
            <Input placeholder="输入该题目的核心问题，例如: Java中的各种锁" />
          </Form.Item>

          <Form.Item label="题目补充说明 / 代码块 (可选)" name="content">
            <TextArea rows={3} placeholder="如果需要补充额外的代码段或前置条件，写在这里..." />
          </Form.Item>

          <Card title="配置 A/B/C/D 四个选项" type="inner" size="small" style={{ marginBottom: 24 }}>
            <Form.List name="options">
              {(fields) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'optionLabel']} style={{ width: 60, marginBottom: 0 }}>
                        <Input readOnly style={{ fontWeight: 'bold', textAlign: 'center' }} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'optionContent']} rules={[{ required: true, message: '选项内容必填' }]} style={{ flex: 1, width: 450, marginBottom: 0 }}>
                        <Input placeholder="选项内容描述" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'sortOrder']} hidden>
                        <Input />
                      </Form.Item>
                    </Space>
                  ))}
                </>
              )}
            </Form.List>
          </Card>

          <Form.Item label="正确答案" name="correctOptionLabel" rules={[{ required: true, message: '请选择正确答案' }]}>
            <Select placeholder="请选择正确选项">
              <Option value="A">A</Option>
              <Option value="B">B</Option>
              <Option value="C">C</Option>
              <Option value="D">D</Option>
            </Select>
          </Form.Item>

          <Form.Item label="完整解析与拓展阅读" name="analysis" rules={[{ required: true, message: '必须录入解析才能帮助用户复盘' }]}>
            <TextArea rows={4} placeholder="深入解析为什么选这个答案，及其背后的底层原理..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 24 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit" loading={saving}>确认保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
