import React from 'react';
import { Card, Row, Col, Typography, Divider, Progress, Space, Tag, Empty, Button } from 'antd';
import type { CategoryStatVO, WeaknessAnalysisVO } from '../types';

const { Title, Text } = Typography;

interface Props {
  statData: CategoryStatVO[];
  analysisData: WeaknessAnalysisVO[];
  onReviewWrongCategory: (category: string) => void;
}

export const AnalysisDashboard: React.FC<Props> = ({ statData, analysisData, onReviewWrongCategory }) => {
  const hasStats = statData.length > 0;
  const totalCount = statData.reduce((sum, item) => sum + item.totalCount, 0);
  const correctCount = statData.reduce((sum, item) => sum + item.correctCount, 0);
  const wrongCount = statData.reduce((sum, item) => sum + item.wrongCount, 0);
  const totalRate = totalCount > 0 ? ((correctCount * 100) / totalCount).toFixed(1) : '0.0';
  const weaknessCount = analysisData.filter(item => item.level === '薄弱').length;
  const analysisMap = new Map(analysisData.map(item => [item.category, item]));

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {hasStats && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card><Text type="secondary">总答题数</Text><Title level={3} style={{ margin: '8px 0 0' }}>{totalCount}</Title></Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card><Text type="secondary">正确题数</Text><Title level={3} style={{ margin: '8px 0 0', color: '#0f766e' }}>{correctCount}</Title></Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card><Text type="secondary">错误题数</Text><Title level={3} style={{ margin: '8px 0 0', color: '#dc2626' }}>{wrongCount}</Title></Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card><Text type="secondary">总体正确率</Text><Title level={3} style={{ margin: '8px 0 0', color: '#3b82f6' }}>{totalRate}%</Title></Card>
          </Col>
          <Col span={24}>
            <Card>
              <Text strong style={{ color: '#1e293b' }}>优先复习方向：</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {weaknessCount > 0 ? `当前有 ${weaknessCount} 个薄弱分类，建议优先从薄弱项开始复盘。` : '当前没有明显薄弱分类，继续保持稳定练习。'}
              </Text>
            </Card>
          </Col>
        </Row>
      )}

      <Card title="各分类能力诊断">
        {!hasStats ? (
          <Empty description="暂无能力诊断。完成几道题后，这里会自动生成各分类正确率与复习建议。" />
        ) : (
          <Row gutter={[20, 20]}>
            {statData.map(stat => {
              const rate = Number.parseFloat(stat.correctRate).toFixed(1);
              const analysis = analysisMap.get(stat.category);
              let tagColor: "error" | "success" | "warning" = 'warning';
              if (analysis?.level === '薄弱') tagColor = 'error';
              if (analysis?.level === '良好') tagColor = 'success';
              return (
                <Col xs={24} sm={12} lg={8} key={stat.category}>
                  <Card size="small" style={{ border: '1px solid #d9e2ec', borderRadius: 8, height: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Title level={5} style={{ margin: 0, color: '#1e293b' }}>{stat.category}</Title>
                      {analysis && <Tag color={tagColor}>{analysis.level}</Tag>}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>答题总数：{stat.totalCount} 次</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>正确：{stat.correctCount} | 错误：{stat.wrongCount}</Text>
                    <Divider style={{ margin: '10px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text>正确率：</Text>
                      <Text strong>{rate}%</Text>
                    </div>
                    <Progress percent={Number(rate)} showInfo={false} strokeColor={{ '0%': '#3b82f6', '100%': '#0f766e' }} status="active" />
                    <div style={{ color: '#475569', minHeight: 44, marginTop: 12 }}>
                      {analysis?.suggestion || '继续完成更多题目后，系统会生成更准确的学习建议。'}
                    </div>
                    {stat.wrongCount > 0 && (
                      <Button size="small" type="primary" style={{ marginTop: 12 }} onClick={() => onReviewWrongCategory(stat.category)}>
                        复盘该分类错题
                      </Button>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>
    </Space>
  );
};
