// @/views/finance/StockMonthlyAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  DatePicker, 
  Select, 
  Spin, 
  Alert, 
  Row, 
  Col, 
  Statistic, 
  Tabs,
  Typography 
} from 'antd';
import { Line, Column } from '@ant-design/charts';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import type { StockMonthlyData} from '@/types';
import { StockMonthlyAPI } from '@/service/stock/stockMonthly';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

// K线图组件
const KLineChart: React.FC<{ data: StockMonthlyData[] }> = ({ data }) => {
  const chartData = data.map(item => ({
    date: item.yearMonth,
    open: item.open,
    close: item.close,
    high: item.high,
    low: item.low,
  }));

  const config = {
    data: chartData,
    xField: 'date',
    yField: ['open', 'close', 'high', 'low'],
    meta: {
      date: { alias: '日期' },
      open: { 
        alias: '开盘价', 
        formatter: (v: number) => `¥${v?.toFixed(2) || '0.00'}` 
      },
      close: { 
        alias: '收盘价', 
        formatter: (v: number) => `¥${v?.toFixed(2) || '0.00'}` 
      },
      high: { 
        alias: '最高价', 
        formatter: (v: number) => `¥${v?.toFixed(2) || '0.00'}` 
      },
      low: { 
        alias: '最低价', 
        formatter: (v: number) => `¥${v?.toFixed(2) || '0.00'}` 
      },
    },
    slider: { start: 0.1, end: 0.9 },
    tooltip: {
      crosshairs: { line: { stroke: 'rgba(24, 144, 255, 0.5)', lineWidth: 2 } },
    },
    lineStyle: { lineWidth: 2 },
    color: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
    height: 400,
  };

  return <Line {...config} />;
};

// 股价走势图
const StockChart: React.FC<{ data: StockMonthlyData[] }> = ({ data }) => {
  const chartData = data.map(item => ({
    date: item.yearMonth,
    price: item.close,
  }));

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'price',
    xAxis: { type: 'time' },
    meta: {
      date: { alias: '日期' },
      price: { 
        alias: '价格', 
        formatter: (v: number) => `¥${v?.toFixed(2) || '0.00'}` 
      },
    },
    smooth: true,
    slider: { start: 0.1, end: 0.9 },
    tooltip: {
      formatter: (datum: any) => ({
        name: '收盘价',
        value: `¥${datum.price?.toFixed(2) || '0.00'}`,
      }),
    },
    color: '#1890ff',
    height: 400,
  };

  return <Line {...config} />;
};

// 成交量图
const VolumeChart: React.FC<{ data: StockMonthlyData[] }> = ({ data }) => {
  const chartData = data.map(item => ({
    date: item.yearMonth,
    volume: item.volume / 10000,
  }));

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'volume',
    meta: {
      date: { alias: '日期' },
      volume: { alias: '成交量(万手)' },
    },
    slider: { start: 0.1, end: 0.9 },
    color: '#52c41a',
    height: 400,
  };

  return <Column {...config} />;
};

// 主组件
const StockMonthlyAnalysis: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockMonthlyData[]>([]);
  const [stockCode, setStockCode] = useState<string>('600519.SH');
  const [dateRange, setDateRange] = useState<[string, string]>(['2023-01', '2023-12']);

  // 常用股票代码选项
  const StockOptionDTOs: {code: string;name: string;}[] = [
    { code: '600519.SH', name: '贵州茅台' },
    { code: '000858.SZ', name: '五粮液' },
    { code: '601318.SH', name: '中国平安' },
    { code: '600036.SH', name: '招商银行' },
    { code: '000333.SZ', name: '美的集团' },
    { code: '600276.SH', name: '恒瑞医药' },
  ];

  // 获取数据
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {

      const [stockMonthlyData] = await Promise.all([
        StockMonthlyAPI.getStockMonthlyData(stockCode, dateRange[0], dateRange[1]),
      ]);
      setStockData(stockMonthlyData || []);
    } catch (err: any) {
      setError(err.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 日期范围改变
  const handleDateChange = (_: any, dateStrings: [string, string]) => {
    if (dateStrings[0] && dateStrings[1]) {
      setDateRange(dateStrings);
    }
  };

  // 股票代码改变
  const handleStockChange = (value: string) => {
    setStockCode(value);
  };

  // 初始加载数据
  useEffect(() => {
    loadData();
  }, [stockCode, dateRange]);

  // 计算统计数据
  const stats = stockData.length > 0 ? {
    currentPrice: stockData[stockData.length - 1].close,
    change: stockData[stockData.length - 1].close - stockData[0].open,
    changePercent: ((stockData[stockData.length - 1].close - stockData[0].open) / stockData[0].open * 100).toFixed(2),
    highest: Math.max(...stockData.map(item => item.high)),
    lowest: Math.min(...stockData.map(item => item.low)),
    avgVolume: (stockData.reduce((sum, item) => sum + item.volume, 0) / stockData.length / 10000).toFixed(0),
    totalAmount: (stockData.reduce((sum, item) => sum + item.amount, 0) / 100000000).toFixed(2),
  } : null;

  // ProTable列定义
  const columns: ProColumns<StockMonthlyData>[] = [
    {
      title: '年月',
      dataIndex: 'yearMonth',
      key: 'yearMonth',
      width: 100,
      fixed: 'left',
    },
    {
      title: '股票代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '开盘价',
      dataIndex: 'open',
      key: 'open',
      renderText: (text: number) => `¥${text?.toFixed(2) || '0.00'}`,
      width: 100,
      align: 'right' as const,
      sorter: (a, b) => a.open - b.open,
    },
    {
      title: '最高价',
      dataIndex: 'high',
      key: 'high',
      renderText: (text: number) => `¥${text?.toFixed(2) || '0.00'}`,
      width: 100,
      align: 'right' as const,
      sorter: (a, b) => a.high - b.high,
    },
    {
      title: '最低价',
      dataIndex: 'low',
      key: 'low',
      renderText: (text: number) => `¥${text?.toFixed(2) || '0.00'}`,
      width: 100,
      align: 'right' as const,
      sorter: (a, b) => a.low - b.low,
    },
    {
      title: '收盘价',
      dataIndex: 'close',
      key: 'close',
      renderText: (text: number) => `¥${text?.toFixed(2) || '0.00'}`,
      width: 100,
      align: 'right' as const,
      sorter: (a, b) => a.close - b.close,
    },
    {
      title: '涨跌幅',
      key: 'changePercent',
      width: 100,
      align: 'right' as const,
      render: (_, record, index) => {
        if (index === 0) return '-';
        const prevClose = stockData[index - 1].close;
        const changePercent = ((record.close - prevClose) / prevClose * 100).toFixed(2);
        return (
          <span style={{ color: record.close >= prevClose ? '#3f8600' : '#cf1322' }}>
            {record.close >= prevClose ? '+' : ''}{changePercent}%
          </span>
        );
      },
    },
    {
      title: '成交量(万手)',
      dataIndex: 'volume',
      key: 'volume',
      renderText: (text: number) => `${(text / 10000)?.toFixed(0) || '0'}`,
      width: 120,
      align: 'right' as const,
      sorter: (a, b) => a.volume - b.volume,
    },
    {
      title: '成交额(亿元)',
      dataIndex: 'amount',
      key: 'amount',
      renderText: (text: number) => `${(text / 100000000)?.toFixed(2) || '0.00'}`,
      width: 120,
      align: 'right' as const,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '调整标志',
      dataIndex: 'adjustflag',
      key: 'adjustflag',
      width: 80,
      align: 'center' as const,
    }
  ];

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Title level={3} style={{ margin: 0 }}>股票月度数据分析</Title>
            <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
              <Select 
                value={stockCode} 
                onChange={handleStockChange}
                style={{ width: 180 }}
                size="large"
                loading={loading}
              >
                {StockOptionDTOs.map(stock => (
                  <Option key={stock.code} value={stock.code}>
                    {stock.name} ({stock.code})
                  </Option>
                ))}
              </Select>
              <RangePicker 
                picker="month" 
                onChange={handleDateChange}
                value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
                size="large"
                disabled={loading}
              />
            </div>
          </div>
        }
        variant="borderless"
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
        extra={
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>数据更新时间: {dayjs().format('YYYY-MM-DD HH:mm')}</span>
          </div>
        }
      >
        {/* 错误提示 */}
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* 统计数据 */}
        {stats && !loading && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic
                  title="当前价格"
                  value={stats.currentPrice}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic
                  title="涨跌额"
                  value={Math.abs(stats.change)}
                  precision={2}
                  prefix={stats.change >= 0 ? "+¥" : "-¥"}
                  valueStyle={{ color: stats.change >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic
                  title="涨跌幅"
                  value={stats.changePercent}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: Number(stats.changePercent) >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic
                  title="最高价"
                  value={stats.highest}
                  precision={2}
                  prefix="¥"
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic
                  title="最低价"
                  value={stats.lowest}
                  precision={2}
                  prefix="¥"
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card size="small">
                <Statistic
                  title="平均成交量"
                  value={stats.avgVolume}
                  suffix="万手"
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>分时数据加载中...</div>
          </div>
        ) : stockData.length > 0 ? (
        <Tabs
          defaultActiveKey="1"
          type="card"
          size="large"
          items={[
            {
              key: '1',
              label: 'K线图',
              children: <KLineChart data={stockData} />,
            },
            {
              key: '2',
              label: '价格走势',
              children: <StockChart data={stockData} />,
            },
            {
              key: '3',
              label: '成交量',
              children: <VolumeChart data={stockData} />,
            },
            {
              key: '4',
              label: '数据表格',
              children: (
                <ProTable<StockMonthlyData>
                  columns={columns}
                  dataSource={stockData}
                  rowKey={(record) => `${record.code}-${record.yearMonth}`}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`,
                  }}
                  scroll={{ x: 1000 }}
                  search={false}
                  options={{
                    density: true,
                    fullScreen: true,
                    reload: () => loadData(),
                    setting: true,
                  }}
                  toolBarRender={false}
                  dateFormatter="string"
                  size="middle"
                />
              ),
            },
          ]}
        />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Alert
              message="暂无数据"
              description="请选择其他时间范围或股票代码"
              type="info"
              showIcon
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default StockMonthlyAnalysis;