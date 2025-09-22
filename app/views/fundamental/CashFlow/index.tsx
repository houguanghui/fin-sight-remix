import React, { useState, useEffect, useMemo } from 'react';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormDatePicker,
  ProTable,
  type ProColumns,
} from '@ant-design/pro-components';
import { Row, Col, Statistic, Alert, Tabs, Spin, notification, Tag, Progress, Space } from 'antd';
import { Line, Pie, Column } from '@ant-design/charts';
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import type { CashFlow, CashFlowHealth, CashFlowQuality, CashFlowTrend } from '@/types';
import { CashFlowAPI } from '@/service/fundamental/cashFlow';

const CashFlowAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [secucode, setSecucode] = useState('600519.SH');
  const [reportDate, setReportDate] = useState('2023-12-31');
  const [cashFlowData, setCashFlowData] = useState<CashFlow[]>([]);
  const [healthData, setHealthData] = useState<CashFlowHealth | null>(null);
  const [trendData, setTrendData] = useState<CashFlowTrend | null>(null);
  const [qualityData, setQualityData] = useState<CashFlowQuality | null>(null);
  const [selectedReport, setSelectedReport] = useState<CashFlow | null>(null);

  // 模拟公司列表
  const companyOptions = [
    { label: '贵州茅台 (600519)', value: '600519.SH' },
  ];

  useEffect(() => {
    loadData();
  }, [secucode, reportDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [flowData, health, trend, quality] = await Promise.all([
        CashFlowAPI.getCashFlowData(secucode, {
          startDate: '2020-01-01',
          endDate: '2023-12-31',
        }),
        CashFlowAPI.getCashFlowHealth(secucode, reportDate),
        CashFlowAPI.getCashFlowTrend(secucode, 5),
        CashFlowAPI.getCashFlowQuality(secucode, reportDate)
      ]);
      setCashFlowData(flowData);
      setHealthData(health);
      setTrendData(trend);
      setQualityData(quality);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

    // 现金流量表数据列定义
  const cashFlowColumns: ProColumns<CashFlow>[] = [
    {
      title: '报告期',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 120,
      renderText: (text: string) => text || '-',
    },
    {
      title: '报告类型',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 100,
      renderText: (text: string) => text || '-',
    },
    {
      title: '经营现金流',
      dataIndex: 'netcashOperate',
      key: 'netcashOperate',
      width: 120,
      render: (_:any, record: CashFlow) => (
        <span style={{ color: (record.netcashOperate||0)>=0 ? '#3f8600' : '#cf1322' }}>
          {record.netcashOperate ? `¥${record.netcashOperate.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: '投资现金流',
      dataIndex: 'netcashInvest',
      key: 'netcashInvest',
      width: 120,
      render: (_:any, record: CashFlow) => (
        <span style={{ color: (record.netcashInvest||0)>=0 ? '#3f8600' : '#cf1322' }}>
          {record.netcashInvest ? `¥${record.netcashInvest.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: '筹资现金流',
      dataIndex: 'netcashFinance',
      key: 'netcashFinance',
      width: 120,
      render: (_:any, record: CashFlow) => (
        <span style={{ color: (record.netcashFinance||0)>=0 ? '#3f8600' : '#cf1322' }}>
          {record.netcashFinance ? `¥${record.netcashFinance.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: '现金净增加',
      dataIndex: 'cceAdd',
      key: 'cceAdd',
      width: 120,
      render: (_:any, record: CashFlow) => (
        <span style={{ color: ((record.endCce||0)-(record.beginCce||0)) >= 0 ? '#3f8600' : '#cf1322' }}>
          {((record.endCce||0)-(record.beginCce||0)) ? `¥${((record.endCce||0)-(record.beginCce||0)).toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_:any, record: CashFlow) => (
        <a onClick={() => setSelectedReport(record)}>
          <EyeOutlined /> 查看
        </a>
      ),
    },
  ];

  const latestData = cashFlowData[0] || {};

  // 转换数据为长格式
  const chartData = useMemo(() => {
    if (!trendData || !trendData.dates) return [];
    
    return trendData.dates.flatMap((date, index) => [
      {
        date,
        category: '经营现金流',
        value: trendData.operatingCashFlows?.[index] || 0,
      },
      {
        date,
        category: '投资现金流',
        value: trendData.investingCashFlows?.[index] || 0,
      },
      {
        date,
        category: '筹资现金流',
        value: trendData.financingCashFlows?.[index] || 0,
      },
    ]);
  }, [trendData]);

  // 现金流趋势图配置
  const trendConfig = {
    data: chartData || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    meta: {
      value: {
        alias: '现金流金额',
      },
      category: {
        alias: '现金流类型',
      },
    },
    smooth: true,
  };

  // 现金流结构饼图配置
  const structureConfig = {
    data: [
      { type: '经营活动', value: Math.abs(latestData.netcashOperate || 0) },
      { type: '投资活动', value: Math.abs(latestData.netcashInvest || 0) },
      { type: '筹资活动', value: Math.abs(latestData.netcashFinance || 0) },
    ].filter(item => item.value > 0),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      text: ({type,value}:any)=>`${type} ${value}`,
      position: 'outside',
    },
    interactions: [{ type: 'element-active' }],
  };

    // 计算质量评分
  const calculateQualityScore = (data: CashFlowQuality | null): number => {
    if (!data) return 0;
    let score = 0;
    if (data.operatingVsProfit) score += 25;
    if (data.freeCashFlowPositive) score += 25;
    if (data.cashIncomeRatioGood) score += 25;
    if (data.reinvestmentRatioGood) score += 25;
    return score;
  };

  const qualityScore = calculateQualityScore(qualityData);
  // 质量评分饼图配置
  const qualityScoreConfig = {
    data: [
      { type: '优秀指标', value: qualityScore },
      { type: '待改进指标', value: 100 - qualityScore },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      text: ({type,value}:any)=>`${type} ${(value).toFixed(0)}%`,
      position: 'outside',
    },
    // label: {
    //   type: 'outer',
    //   content: '{name} {percentage}',
    // },
    color: ['#52c41a', '#ff4d4f'],
  };

  return (
    <PageContainer
      title="现金流量表&分析"
      loading={loading}
      content={
        <ProForm
          submitter={false}
          layout="inline"
          onValuesChange={(changedValues) => {
            if (changedValues.secucode) setSecucode(changedValues.secucode);
            if (changedValues.reportDate) setReportDate(changedValues.reportDate);
          }}
          initialValues={{ secucode, reportDate }}
        >
          <ProFormSelect
            name="secucode"
            label="选择公司"
            options={companyOptions}
            width="md"
          />
          <ProFormDatePicker
            name="reportDate"
            label="报告日期"
            fieldProps={{ format: 'YYYY-MM-DD' }}
            width="md"
          />
        </ProForm>
      }
    >
      <Spin spinning={loading}>
        {/* 健康度提示 */}
        {healthData && (
          <ProCard style={{ marginBottom: 24 }}>
            <Alert
              message={`现金流健康度: ${healthData.healthLevel} (${healthData.score}分)`}
              type={
                healthData.score >= 80 ? 'success' :
                healthData.score >= 60 ? 'info' :
                healthData.score >= 40 ? 'warning' : 'error'
              }
              showIcon
              description={
                healthData.warnings.length > 0 ? (
                  <div>
                    <strong>风险提示:</strong>
                    <ul>
                      {healthData.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : '现金流状况良好'
              }
            />
          </ProCard>
        )}

        {/* 关键指标 */}
        <ProCard title="关键现金流指标" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="经营活动现金流"
                value={latestData.netcashOperate||undefined}
                precision={2}
                valueStyle={{
                  color: (latestData.netcashOperate || 0) >= 0 ? '#3f8600' : '#cf1322',
                }}
                prefix={(latestData.netcashOperate || 0) >= 0 ? '¥' : '-¥'}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="投资活动现金流"
                value={latestData.netcashInvest||undefined}
                precision={2}
                valueStyle={{
                  color: (latestData.netcashInvest || 0) >= 0 ? '#3f8600' : '#cf1322',
                }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="筹资活动现金流"
                value={latestData.netcashFinance||undefined}
                precision={2}
                valueStyle={{
                  color: (latestData.netcashFinance || 0) >= 0 ? '#3f8600' : '#cf1322',
                }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="自由现金流"
                value={(latestData.netcashOperate || 0) - (latestData.constructLongAsset || 0)}
                precision={2}
                valueStyle={{
                  color: ((latestData.netcashOperate || 0) - (latestData.constructLongAsset || 0)) >= 0 
                    ? '#3f8600' : '#cf1322',
                }}
              />
            </Col>
          </Row>
        </ProCard>

        {/* 图表分析 */}
        <Tabs
          items={[
            {
              key: 'trend',
              label: '趋势分析',
              children: (
                <ProCard>
                  <Line {...trendConfig} height={400} />
                </ProCard>
              ),
            },
            {
              key: 'structure',
              label: '结构分析',
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <ProCard title="现金流结构">
                      <Pie {...structureConfig} height={300} />
                    </ProCard>
                  </Col>
                  <Col span={12}>
                    <ProCard title="现金及现金等价物">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="期初现金余额"
                            value={latestData.beginCce||undefined}
                            precision={2}
                            prefix="¥"
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="期末现金余额"
                            value={latestData.endCce||undefined}
                            precision={2}
                            prefix="¥"
                          />
                        </Col>
                        <Col span={24} style={{ marginTop: 16 }}>
                          <Statistic
                            title="现金净增加额"
                            value={(latestData.endCce || 0) - (latestData.beginCce || 0)}
                            precision={2}
                            valueStyle={{
                              color: ((latestData.endCce || 0) - (latestData.beginCce || 0)) >= 0 
                                ? '#3f8600' : '#cf1322',
                            }}
                            prefix={((latestData.endCce || 0) - (latestData.beginCce || 0)) >= 0 ? '¥' : '-¥'}
                          />
                        </Col>
                      </Row>
                    </ProCard>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'quality',
              label: '质量分析',
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <ProCard title="现金流质量">
                      <Row gutter={16}>
                        <Col span={12}>
                          <ProCard title="经营现金流质量" bordered>
                            <Statistic
                              title="经营现金流"
                              value={qualityData?.operatingCashFlow}
                              precision={2}
                              valueStyle={{
                                color: (qualityData?.operatingCashFlow || 0) >= 0 ? '#3f8600' : '#cf1322',
                              }}
                              prefix="¥"
                            />
                            <div style={{ marginTop: 16 }}>
                              <Tag color={qualityData?.operatingVsProfit ? 'green' : 'red'}>
                                {qualityData?.operatingVsProfit ? '优于净利润' : '低于净利润'}
                              </Tag>
                            </div>
                          </ProCard>
                        </Col>
                        <Col span={12}>
                          <ProCard title="自由现金流" bordered>
                            <Statistic
                              title="自由现金流"
                              value={qualityData?.freeCashFlow}
                              precision={2}
                              valueStyle={{
                                color: (qualityData?.freeCashFlow || 0) >= 0 ? '#3f8600' : '#cf1322',
                              }}
                              prefix="¥"
                            />
                            <div style={{ marginTop: 16 }}>
                              <Tag color={qualityData?.freeCashFlowPositive ? 'green' : 'red'}>
                                {qualityData?.freeCashFlowPositive ? '正向现金流' : '负向现金流'}
                              </Tag>
                            </div>
                          </ProCard>
                        </Col>
                        {qualityData?.cashIncomeRatio && (
                          <Col span={24} style={{ marginTop: 16 }}>
                            <ProCard title="现金收入质量" bordered>
                              <Progress
                                type="circle"
                                percent={Math.round((qualityData.cashIncomeRatio || 0) * 100)}
                                size={80}
                                status={qualityData.cashIncomeRatioGood ? 'success' : 'exception'}
                              />
                              <div style={{ marginTop: 16 }}>
                                <Tag color={qualityData.cashIncomeRatioGood ? 'green' : 'red'}>
                                  现金收入比率: {(qualityData.cashIncomeRatio * 100).toFixed(1)}%
                                </Tag>
                              </div>
                            </ProCard>
                          </Col>
                        )}
                      </Row>
                    </ProCard>
                  </Col>
                  <Col span={12}>
                    <ProCard title="质量评分">
                      <Pie {...qualityScoreConfig} height={300} />
                      <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Statistic
                          title="综合质量评分"
                          value={qualityScore}
                          precision={0}
                          suffix="/100"
                          valueStyle={{
                            color: qualityScore >= 80 ? '#3f8600' :
                                  qualityScore >= 60 ? '#faad14' : '#cf1322',
                          }}
                        />
                      </div>
                    </ProCard>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'comparison',
              label: '对比分析',
              children: (
                <ProCard>
                  <ComparisonAnalysis secucode={secucode} reportDate={reportDate} />
                </ProCard>
              ),
            },
          ]}
        />

        {/* 现金流量表数据表格 */}
        <ProCard 
          title={
            <Space >
              <FileTextOutlined />
              现金流量表数据
            </Space>
          } 
          style={{ marginBottom: 24 }}
          extra={selectedReport && `当前查看: ${selectedReport.reportDate}`}
        >
          <ProTable<CashFlow>
            columns={cashFlowColumns}
            dataSource={cashFlowData}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
            }}
            search={false}
            options={false}
            rowKey="id"
            size="small"
          />
        </ProCard>
      </Spin>
    </PageContainer>
  );
};

// 对比分析组件
const ComparisonAnalysis: React.FC<{ secucode: string; reportDate: string }> = ({
  secucode,
  reportDate,
}) => {
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    loadComparisonData();
  }, [secucode, reportDate]);

  const loadComparisonData = async () => {
    try {
      const data = await CashFlowAPI.compareCashFlow({
        secucodes: ['000001.SZ', '000002.SZ', '600519.SH'], // 示例对比公司
        reportDate,
      });
      setComparisonData(data.peers || []);
    } catch (error) {
      console.error('加载对比数据失败:', error);
    }
  };

  const config = {
    data: comparisonData,
    xField: 'securityNameAbbr',
    yField: 'netcashOperate',
    label: {
      textBaseline: 'bottom',
    },
    // style: {
    //   fill: '#FFFFFF',
    //   opacity: 0.6,
    // },
    meta: {
      securityNameAbbr: { alias: '公司名称' },
      netcashOperate: { alias: '经营现金流' },
    },
  };

  return <Column {...config} height={300} />;
};

export default CashFlowAnalysis;