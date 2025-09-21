// src/pages/BalanceSheet/index.tsx
import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Select, DatePicker, Spin, Alert, Table, Tag } from 'antd';
import { Pie, Line } from '@ant-design/charts';
import type { ColumnsType } from 'antd/es/table';
import type { BalanceSheet } from '@/types/index'
import { BalanceSheetAPI } from '@/service/fundamental/balanceSheetService';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const BalanceSheetPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BalanceSheet[]>([]);
  const [selectedStock, setSelectedStock] = useState('600519.SH');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(15, 'month'),
    dayjs(),
  ]);
  const [currentData, setCurrentData] = useState<BalanceSheet | null>(null);

  const stockOptions = [
    { value: '600519.SH', label: '贵州茅台' },
    { value: '000858.SZ', label: '五粮液' },
    { value: '600036.SH', label: '招商银行' },
    { value: '601318.SH', label: '中国平安' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balanceSheet] = await Promise.all([
        BalanceSheetAPI.getBalanceSheetByDateRange(
            selectedStock, 
            dateRange[0].format('YYYY-MM-DD'), 
            dateRange[1].format('YYYY-MM-DD')
          ),
      ])
      const content = balanceSheet?.content || []
      setData(content)
      setCurrentData((content&&content[content.length-1]) || null)
    } catch (error) {
      console.error('获取资产负债表数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStock, dateRange]);


  
  // 资产结构饼图配置
const assetPieConfig = {
  data: currentData ? [
    { type: '货币资金', value: currentData.monetaryfunds || 0 },
    { type: '存货', value: currentData.inventory || 0 },
    { type: '固定资产', value: currentData.fixedAsset || 0 },
    { type: '无形资产', value: currentData.intangibleAsset || 0 },
    { type: '其他资产', value: (currentData.totalAssets || 0) - 
        ((currentData.monetaryfunds || 0) + (currentData.inventory || 0) + 
         (currentData.fixedAsset || 0) + (currentData.intangibleAsset || 0)) },
  ].filter(item => item.value > 0) : [],
  angleField: 'value',
  colorField: 'type',
  radius: 0.8,
  labels: [
    {
      text: ({ value }: any) => `${(value / 1e8).toFixed(1)}亿`,
      style: {
        fontSize: 11,
        fill: '#666',
        dy: 0,
      },
    },
  ],
  tooltip: {
    title: '资产构成',
    items: [
      { field: 'type', name: '资产类型' },
      { field: 'value', name: '金额', channel: 'angle', valueFormatter: (v: number) => `${(v / 1e8).toFixed(2)}亿` },
       { field: 'value', name: '占比', channel: 'angle', valueFormatter: (v: number) => `${(v / (
        (currentData?.monetaryfunds || 0) +
        (currentData?.inventory || 0) +
        (currentData?.fixedAsset || 0) +
        (currentData?.intangibleAsset || 0) +
        ((currentData?.totalAssets || 0) - 
        ((currentData?.monetaryfunds || 0) + (currentData?.inventory || 0) + 
         (currentData?.fixedAsset || 0) + (currentData?.intangibleAsset || 0)))
        )
          * 100).toFixed(1)}%` },
    ],
  },
  legend: {
    position: 'bottom',
    itemName: {
      style: {
        fontSize: 12,
      },
    },
  },
  interactions: [{ type: 'element-active' }],
  height: 300,
  autoFit: true,
};

  // 资产负债率趋势图配置
  const debtRatioConfig = {
    data: data.map(item => ({
      reportDate: item.reportDate,
      debtRatio: item.totalAssets ? (item.totalLiabilities / item.totalAssets) * 100 : 0,
      securityNameAbbr: item.securityNameAbbr
    })),
    xField: 'reportDate',
    yField: 'debtRatio',
    xAxis: {
      type: 'time',
      label: {
        formatter: (value: string) => {
          const date = new Date(value);
          return `${date.getFullYear()}Q${Math.floor(date.getMonth() / 3) + 1}`;
        },
      },
    },
    yAxis: {
      label: {
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
    },
    smooth: true,
    height: 300,
  };

  // 表格列定义
  const tableColumns: ColumnsType<BalanceSheet> = [
    {
      title: '报告期',
      dataIndex: 'reportDate',
      key: 'reportDate',
      render: (date: string) => {
        const d = new Date(date);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
      },
    },
    {
      title: '报表类型',
      dataIndex: 'reportType',
      key: 'reportType',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '总资产(亿)',
      dataIndex: 'totalAssets',
      key: 'totalAssets',
      render: (value: number) => (value / 1e8).toFixed(2),
      align: 'right' as const,
    },
    {
      title: '总负债(亿)',
      dataIndex: 'totalLiabilities',
      key: 'totalLiabilities',
      render: (value: number) => (value / 1e8).toFixed(2),
      align: 'right' as const,
    },
    {
      title: '资产负债率',
      key: 'debtRatio',
      render: (_, record) => 
        record.totalAssets ? 
          <Tag color={record.totalLiabilities / record.totalAssets > 0.7 ? 'red' : 'green'}>
            {((record.totalLiabilities / record.totalAssets) * 100).toFixed(2)}%
          </Tag> : 
          '-',
      align: 'center' as const,
    },
  ];

  return (
    <PageContainer
      header={{
        title: '资产负债表分析',
      }}
      extra={[
        <Select
          key="stock"
          value={selectedStock}
          onChange={setSelectedStock}
          style={{ width: 200, marginRight: 16 }}
          loading={loading}
        >
          {stockOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>,
        <RangePicker
          key="date"
          onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          picker="quarter"
          defaultValue={dateRange}
          style={{ width: 300 }}
        />,
      ]}
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>分时数据加载中...</div>
        </div>
      )}

      {!loading && !currentData && (
        <Alert
          message="暂无数据"
          description="请选择股票查看资产负债表数据"
          type="info"
          showIcon
        />
      )}

      {!loading && currentData && (
        <>
          {/* 关键指标 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总资产"
                  value={currentData.totalAssets}
                  precision={2}
                  formatter={(value) => `¥${(Number(value) / 1e8).toFixed(2)}亿`}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总负债"
                  value={currentData.totalLiabilities}
                  precision={2}
                  formatter={(value) => `¥${(Number(value) / 1e8).toFixed(2)}亿`}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="净资产"
                  value={currentData.totalEquity}
                  precision={2}
                  formatter={(value) => `¥${(Number(value) / 1e8).toFixed(2)}亿`}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="资产负债率"
                  value={currentData.totalAssets ? 
                    (currentData.totalLiabilities / currentData.totalAssets) * 100 : 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{
                    color: currentData.totalLiabilities / currentData.totalAssets > 0.7 ? 
                      '#cf1322' : '#3f8600'
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* 图表分析 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="资产结构分析">
                <Pie {...assetPieConfig} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="资产负债率趋势">
                <Line {...debtRatioConfig} />
              </Card>
            </Col>
          </Row>

          {/* 数据表格 */}
          <Card title="历史数据">
            <Table
              columns={tableColumns}
              dataSource={data}
              rowKey="id"
              pagination={false}
              size="middle"
              loading={loading}
            />
          </Card>
        </>
      )}
    </PageContainer>
  );
};

export default BalanceSheetPage;