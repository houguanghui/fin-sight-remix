// @/views/finance/StockMinuteChart/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Spin, message, Row, Col, Statistic, Space, Input } from 'antd';
import { Line } from '@ant-design/charts';
import dayjs from 'dayjs';
import type { StockMinuteData } from '@/types';
import { StockMinuteAPI } from '@/service/stock/stockMinuteService';

const { RangePicker } = DatePicker;
const { Option } = Select;

const StockMinuteChart: React.FC = () => {
  const [market, setMarket] = useState<string>('SH');
  const [symbol, setSymbol] = useState<string>('600519');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs('2025-09-05'),
    // dayjs('2025-09-05').subtract(3, 'day'),
    dayjs('2025-09-05'),
  ]);
  const [chartData, setChartData] = useState<StockMinuteData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  let postChartData: any = null

  // 获取股票代码
  const stockCode = `${symbol}.${market}`
  const setStockCode = async (stockCode: string) => {
    const [symbol, market] = stockCode.split('.');
    setSymbol(symbol || '')
    setMarket(market || 'SH')
  }

  // 获取股票分时数据
  const fetchData = async () => {
    if (!stockCode || !dateRange[0] || !dateRange[1]) {
      message.warning('请选择股票代码和日期范围');
      return;
    }

    setLoading(true);
    try {
      const startDate = dateRange[0]?.format('YYYY-MM-DD');
      const endDate = dateRange[1]?.format('YYYY-MM-DD');
      const [minuteDataList] = await Promise.all([
        StockMinuteAPI.getStockMinuteData(stockCode, startDate, endDate),
      ]);
      setChartData(minuteDataList);
    } catch (error) {
      message.error(`数据获取失败: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

   // 处理图表数据，添加交易时段外
  const processChartData = (data: StockMinuteData[]) => {
    let lastIndex = data.length - 1
    let xIndex = 0;
    postChartData =  data.flatMap((item,index)=>{
      const timeField = dayjs(item.time.toString(),'YYYYMMDDHHmmssSSS')
      const hours = timeField.hour();
      const minutes = timeField.minute();
      const totalMinutes = hours * 60 + minutes;

      if(index == lastIndex){
        return [
          {
            ...item,
            timeField,
            index: xIndex++
          }
        ]
      }
      // [570, 690, 780, 900]
      if([690, 900].includes(totalMinutes)) {
        return[
          {
            ...item,
            timeField,
            index: xIndex++
          },
          {
            ...item,
            close: NaN,
            timeField: timeField.add(5,'minute'),
            index: xIndex++
          },
        ]
      }

      return [
        {
          ...item,
          timeField,
          index: xIndex++
        }
      ]
    })
    return postChartData
  };

  const chartConfig = {
    data: processChartData(chartData),
    xField: 'index',
    yField: 'close',
    interaction: {
      tooltip: {
        render: (e: Event, {items, title}: {items: Array<{name: string, value: Number, color: string}>, title: string}) => {
          const list = items.filter((item) => item.value);
          return (
            <div key={title.toString()}>
              <h4>{list[0]?postChartData[parseInt(title)].timeField.format('YYYY年MM月DD日 HH:mm'):'休盘'}</h4>
              {list.map((item,index) => {
                const { name, value, color } = item;
                return (
                  <div key={index}>
                    <div style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: color,
                            marginRight: 6,
                          }}
                        ></span>
                        <span>收盘价</span>
                      </div>
                      <b>{value.toString()}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
    },
    axis: {
      x: {
       labelFormatter: (index:number) => {
        return `${postChartData[index].timeField.hour()}:${postChartData[index].timeField.minute()}`
       }
      }
    },
    legend: true,
    connectNulls: {
      connect: true,
      connectStroke: '#aaa',
    },
  }

  // 计算统计数据（只计算交易时段内的数据）
  const calculateStats = () => {
    if (chartData.length === 0) return null;

    const tradingData = chartData.filter(item => {
      const timeStr = item.time.toString().padStart(17, '0');
      const hour = parseInt(timeStr.slice(8, 10));
      const minute = parseInt(timeStr.slice(10, 12));
      const totalMinutes = hour * 60 + minute;
      return (totalMinutes >= 570 && totalMinutes <= 690) || 
             (totalMinutes >= 780 && totalMinutes <= 900);
    });

    if (tradingData.length === 0) return null;

    const closes = tradingData.map(d => d.close);
    const volumes = tradingData.map(d => d.volume);
    
    return {
      minPrice: Math.min(...closes),
      maxPrice: Math.max(...closes),
      avgPrice: closes.reduce((a, b) => a + b, 0) / closes.length,
      totalVolume: volumes.reduce((a, b) => a + b, 0),
      lastPrice: closes[closes.length - 1],
    };
  };

  const stats = calculateStats();

  useEffect(()=>{
    fetchData()
  },[])

  return (
    <div style={{ padding: 24 }}>
      <Card title="股票分时走势图" variant={"borderless"}>
        {/* 查询条件 */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Space.Compact>
            <Select value={market} onChange={setMarket}>
              <Option value="SH">上证 (SH)</Option>
              <Option value="SZ">深证 (SZ)</Option>
            </Select>
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value)}/>
          </Space.Compact>

          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />

          <button 
            onClick={fetchData}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '查询中...' : '查询'}
          </button>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>分时数据加载中...</div>
          </div>
        )}

        {/* 图表展示 */}
        {!loading && chartData.length > 0 && (
          <div>
            {/* 统计数据 */}
            {stats && (
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={4}>
                  <Statistic title="当前价格" value={stats.lastPrice.toFixed(2)} suffix="元" />
                </Col>
                <Col span={4}>
                  <Statistic title="最低价" value={stats.minPrice.toFixed(2)} suffix="元" />
                </Col>
                <Col span={4}>
                  <Statistic title="最高价" value={stats.maxPrice.toFixed(2)} suffix="元" />
                </Col>
                <Col span={4}>
                  <Statistic title="平均价" value={stats.avgPrice.toFixed(2)} suffix="元" />
                </Col>
                <Col span={4}>
                  <Statistic title="总成交量" value={(stats.totalVolume / 10000).toFixed(0)} suffix="万股" />
                </Col>
              </Row>
            )}

            <div style={{ marginBottom: 24 }}>
              <h3>分时走势图</h3>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: 8 }}>
              </div>
              <Line {...chartConfig} />
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!loading && chartData.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无分时数据，请选择股票代码和日期范围后查询
          </div>
        )}
      </Card>
    </div>
  );
};

export default StockMinuteChart;