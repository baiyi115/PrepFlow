import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Input, Empty } from 'antd';
import type { QuestionVO } from '../types';

const { Title, Text } = Typography;

interface Props {
  questionList: QuestionVO[];
  onSelectCategory: (category: string) => void;
}

export const QuestionBankList: React.FC<Props> = ({ questionList, onSelectCategory }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. 统计每个分类的题目数
  const categoryCounts = questionList.reduce((acc, q) => {
    const cat = q.category || '其它';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allCategories = Object.keys(categoryCounts);

  // 2. 根据搜索过滤展示的题库卡片
  const displayCategories = allCategories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 0 30px' }}>
      
      {/* 1. 顶部标题与搜索栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>精选面试题库</Title>
          <Text type="secondary">专项突破大厂面试难题，多维度覆盖主流核心技术栈</Text>
        </div>
        <Input.Search 
          placeholder="搜索题库..." 
          allowClear 
          style={{ width: 320 }} 
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 2. 磁贴式卡片网格区域 */}
      {displayCategories.length === 0 ? (
        <Card>
          <Empty description="暂无匹配的题库分类" />
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {displayCategories.map(cat => {
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={cat}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s'
                }}
                styles={{
                  body: { padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }
                }}
                onClick={() => onSelectCategory(cat)}
              >
                <div style={{ flex: 1 }}>
                  {/* 分类标题 */}
                  <Title level={4} style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700 }}>
                    {cat}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    收录该专区下的全部面试真题，助你高效通关。
                  </Text>
                </div>

                {/* 卡片页脚信息及交互 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 16, borderTop: '1px dashed #f0f0f0' }}>
                  <Tag color="blue" style={{ borderRadius: 4 }}>{categoryCounts[cat] || 0} 道题</Tag>
                  <Button type="link" style={{ padding: 0 }}>立即刷题</Button>
                </div>
              </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};
