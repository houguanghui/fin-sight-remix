import React, { useState, useEffect } from 'react';
import {
  PageContainer,
  ProCard,
  ProTable,
} from '@ant-design/pro-components';
import { Line, Column, Pie, Gauge } from '@ant-design/charts';
import { Select, Row, Col, Statistic, Typography, Divider, Card, Spin, Alert } from 'antd';
import { ProfitService } from '@/service/fundamental/profitService';
import type { GrowthAnalysisDTO, ProfitabilityAnalysisDTO, ProfitAnalysis } from '@/types';

const { Text } = Typography;
const { Option } = Select;

const ProfitAnalysis: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState('600519.SH');
  const [profitData, setProfitData] = useState<ProfitAnalysis[]>([]);
  const [growthData, setGrowthData] = useState<GrowthAnalysisDTO[]>([]);
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityAnalysisDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stockOptions = [
    { value: '600519.SH', label: '贵州茅台' },
    { value: '000858.SZ', label: '五粮液' },
    { value: '601318.SH', label: '中国平安' },
    { value: '000333.SZ', label: '美的集团' },
  ];

  useEffect(() => {
    loadData();
  }, [selectedStock]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [historyData, growthData, profitabilityData] = await Promise.all([
        ProfitService.getProfitHistory(selectedStock),
        ProfitService.analyzeGrowthTrend(selectedStock, 5),
        ProfitService.analyzeProfitability(selectedStock),
      ]);
      
      setProfitData(historyData);
      setGrowthData(growthData);
      setProfitabilityData(profitabilityData);
    } catch (err) {
      console.error('加载数据失败:', err);
      setError(err instanceof Error ? err.message : '数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化金额显示（亿元）
  const formatAmount = (amount: number | undefined) => {
    if (!amount) return '0.00';
    return (amount / 100000000).toFixed(2);
  };

  // 格式化百分比
  const formatPercent = (value: number | undefined) => {
    if (!value) return '0.00';
    return value.toFixed(2);
  };

  // 收入利润趋势图配置
  const revenueProfitConfig = {
    height: 300,
    padding: 'auto' as const,
    xField: 'reportDate',
    yField: 'value',
    seriesField: 'type',
    xAxis: {
      title: { text: '报告期' },
      label: {
        formatter: (text: string) => text.slice(0, 7), // 只显示年月
      },
    },
    yAxis: {
      title: { text: '金额(亿元)' },
      label: {
        formatter: (value: number) => `${(value / 100000000).toFixed(0)}`,
      },
    },
    legend: {
      position: 'top' as const,
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'wave-in' as const,
        duration: 1000,
      },
    },
  };

  // 毛利率净利率趋势图配置
  const marginConfig = {
    height: 300,
    padding: 'auto' as const,
    xField: 'reportDate',
    yField: 'value',
    seriesField: 'type',
    xAxis: {
      title: { text: '报告期' },
      label: {
        formatter: (text: string) => text.slice(0, 7),
      },
    },
    yAxis: {
      title: { text: '比率(%)' },
      label: {
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
    },
    legend: {
      position: 'top' as const,
    },
    smooth: true,
  };

  // 增长指标柱状图配置
  const growthConfig = {
    height: 300,
    padding: 'auto' as const,
    xField: 'year',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    xAxis: {
      title: { text: '年份' },
    },
    yAxis: {
      title: { text: '增长率(%)' },
      label: {
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
    },
    legend: {
      position: 'top' as const,
    },
  };

  // 费用结构饼图配置（使用正确的labels格式）
  const expenseConfig = {
    height: 300,
    data: profitabilityData?.expenseRatios 
      ? Object.entries(profitabilityData.expenseRatios).map(([name, value]) => ({
          type: name.replace('Ratio', '').replace(/([A-Z])/g, ' $1'),
          value: Math.abs(value),
        }))
      : [],
    angleField: 'value',
    colorField: 'type',
    labels: [
      {
        text: ({ type, value }: any) => `${value}%`,
        style: {
          fontSize: 12,
          fontWeight: 'bold',
          fill: '#333',
          textAlign: 'center',
        },
        position: 'inside',
        connector: false,
      },
    ],
    tooltip: {
      items: [{ field: 'value', name: '占比', valueFormatter: (value: number) => `${value}%` }],
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 3,
      },
    },
    interactions: [{ type: 'element-active' }],
  };

  const gaugeConfig = {
    height: 300,
    autoFit: true,
    data: {
      target: profitabilityData?.profitabilityScore || 0,
      total: 100,
      name: '盈利能力评分',
      thresholds: [33.33, 66.66, 100],
    },
    scale: {
      color: {
        range: ['#F4664A', '#FAAD14', '#30BF78'],
      },
    },
    style: {
      textContent: (target:any, total:any) => `得分：${profitabilityData?.profitabilityScore?.toFixed(1) || 0}\n毛利率: ${formatPercent(profitabilityData?.grossMargin)}%\n净利率: ${formatPercent(profitabilityData?.netMargin)}%`,
      textY: 230,
      textFontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      textBaseline: 'middle',
      fill: '#333',
    },
  };

  // 盈利能力评分仪表盘配置（使用最新API）
  // const gaugeConfig = {
  //   height: 250,
  //   data: {
  //     target: profitabilityData?.profitabilityScore || 0,
  //     total: 100,
  //     name: '盈利能力评分',
  //   },
  //   // 使用 annotations 来添加文本标注
  //   annotations: [
  //     {
  //       type: 'text',
  //       style: {
  //         text: `${profitabilityData?.profitabilityScore?.toFixed(1) || 0}`,
  //         fontSize: 24,
  //         fontWeight: 'bold',
  //         textAlign: 'center',
  //         textBaseline: 'middle',
  //         fill: '#333',
  //       },
  //     },
  //     {
  //       type: 'text',
  //       style: {
  //         text: '得分',
  //         fontSize: 14,
  //         textAlign: 'center',
  //         textBaseline: 'middle',
  //         fill: '#666',
  //         dy: 30,
  //       },
  //     },
  //   ],
  //   // 使用 scale 来设置颜色范围
  //   scale: {
  //     color: {
  //       range: ['#F4664A', '#FAAD14', '#30BF78'],
  //     },
  //   },
  //   tooltip: {
  //     items: [{ name: '得分', value: 'target' }],
  //   },
  //   interactions: [{ type: 'element-active' }],
  // };
  // 准备图表数据
  const revenueProfitChartData = profitData.slice(0, 8).reverse().flatMap(item => [
    {
      reportDate: item.reportDate,
      value: item.operateIncome || 0,
      type: '营业收入',
    },
    {
      reportDate: item.reportDate,
      value: item.netprofit || 0,
      type: '净利润',
    },
  ]);

  const marginChartData = profitData.slice(0, 8).reverse().flatMap(item => [
    {
      reportDate: item.reportDate,
      value: item.grossMargin || 0,
      type: '毛利率',
    },
    {
      reportDate: item.reportDate,
      value: item.netMargin || 0,
      type: '净利率',
    },
  ]);

  const growthChartData = growthData.flatMap(item => [
    {
      year: item.year,
      value: item.revenueGrowth || 0,
      type: '营收增长率',
    },
    {
      year: item.year,
      value: item.profitGrowth || 0,
      type: '利润增长率',
    },
  ]);

  // 费用结构数据
  const expenseData = profitabilityData?.expenseRatios 
    ? Object.entries(profitabilityData.expenseRatios).map(([name, value]) => ({
        name: name.replace('Ratio', '').replace(/([A-Z])/g, ' $1'),
        value: Math.abs(value), // 确保值为正数
      }))
    : [];

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>数据加载中...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {error && (
        <Alert
          message="加载错误"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <ProCard
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>利润表分析</span>
            <Select
              value={selectedStock}
              onChange={setSelectedStock}
              style={{ width: 200, marginLeft: 16 }}
              loading={loading}
            >
              {stockOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        }
        loading={loading}
      >
        {/* 关键指标卡片 */}
        {profitData.length > 0 && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="营业收入"
                    value={formatAmount(profitData[0]?.operateIncome)}
                    precision={2}
                    suffix="亿元"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="净利润"
                    value={formatAmount(profitData[0]?.netprofit)}
                    precision={2}
                    suffix="亿元"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="毛利率"
                    value={formatPercent(profitData[0]?.grossMargin)}
                    precision={2}
                    suffix="%"
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="净利率"
                    value={formatPercent(profitData[0]?.netMargin)}
                    precision={2}
                    suffix="%"
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            {/* 图表区域 */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <ProCard title="收入利润趋势" headerBordered>
                  <Line
                    {...revenueProfitConfig}
                    data={revenueProfitChartData}
                  />
                </ProCard>
              </Col>

              <Col xs={24} lg={12}>
                <ProCard title="盈利能力趋势" headerBordered>
                  <Line
                    {...marginConfig}
                    data={marginChartData}
                  />
                </ProCard>
              </Col>

              <Col xs={24} lg={8}>
                <ProCard title="费用结构分析" headerBordered>
                  {expenseData.length > 0 ? (
                    <Pie {...expenseConfig}/>
                  ) : (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary">暂无费用数据</Text>
                    </div>
                  )}
                </ProCard>
              </Col>

              <Col xs={24} lg={8}>
                <ProCard title="增长指标分析" headerBordered>
                  {growthData.length > 0 ? (
                    <Column
                      {...growthConfig}
                      data={growthChartData}
                    />
                  ) : (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary">暂无增长数据</Text>
                    </div>
                  )}
                </ProCard>
              </Col>

              <Col xs={24} lg={8}>
                <ProCard title="盈利能力评分" headerBordered>
                  {profitabilityData ? (
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                      <Gauge {...gaugeConfig} />
                      {/* <Gauge
                        data={{
                          target: profitabilityData.profitabilityScore,
                          total: 100,
                        }}
                        height={200}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                          {profitabilityData.profitabilityScore.toFixed(1)}
                        </div>
                        <div style={{ fontSize: 14, color: '#666' }}>得分</div>
                      </div>
                      <div style={{ marginTop: 60, fontSize: 12 }}>
                        <Text>毛利率: {formatPercent(profitabilityData.grossMargin)}%</Text>
                        <br />
                        <Text>净利率: {formatPercent(profitabilityData.netMargin)}%</Text>
                      </div> */}
                    </div>
                  ) : (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary">暂无评分数据</Text>
                    </div>
                  )}
                </ProCard>
              </Col>
            </Row>

            {/* 数据表格 */}
            <ProCard title="详细数据" style={{ marginTop: 24 }} headerBordered>
              <ProTable<ProfitAnalysis>
                dataSource={profitData}
                rowKey="reportDate"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                search={false}
                scroll={{ x: 800 }}
                columns={[
                  {
                    title: '报告期',
                    dataIndex: 'reportDate',
                    key: 'reportDate',
                    width: 120,
                    fixed: 'left' as const,
                  },
                  {
                    title: '营业收入(亿元)',
                    dataIndex: 'operateIncome',
                    key: 'operateIncome',
                    renderText: (text) => formatAmount(text),
                    sorter: (a, b) => (a.operateIncome || 0) - (b.operateIncome || 0),
                  },
                  {
                    title: '营收增长率(%)',
                    dataIndex: 'operateIncomeYoy',
                    key: 'operateIncomeYoy',
                    renderText: (text) => formatPercent(text),
                    sorter: (a, b) => (a.operateIncomeYoy || 0) - (b.operateIncomeYoy || 0),
                  },
                  {
                    title: '净利润(亿元)',
                    dataIndex: 'netprofit',
                    key: 'netprofit',
                    renderText: (text) => formatAmount(text),
                    sorter: (a, b) => (a.netprofit || 0) - (b.netprofit || 0),
                  },
                  {
                    title: '净利润增长率(%)',
                    dataIndex: 'netprofitYoy',
                    key: 'netprofitYoy',
                    renderText: (text) => formatPercent(text),
                    sorter: (a, b) => (a.netprofitYoy || 0) - (b.netprofitYoy || 0),
                  },
                  {
                    title: '毛利率(%)',
                    dataIndex: 'grossMargin',
                    key: 'grossMargin',
                    renderText: (text) => formatPercent(text),
                    sorter: (a, b) => (a.grossMargin || 0) - (b.grossMargin || 0),
                  },
                  {
                    title: '每股收益(元)',
                    dataIndex: 'basicEps',
                    key: 'basicEps',
                    renderText: (text) => text?.toFixed(2) || '-',
                    sorter: (a, b) => (a.basicEps || 0) - (b.basicEps || 0),
                  },
                ]}
              />
            </ProCard>
          </>
        )}

        {profitData.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">暂无数据，请选择其他股票或检查数据源</Text>
          </div>
        )}
      </ProCard>
    </PageContainer>
  );
};

export default ProfitAnalysis;