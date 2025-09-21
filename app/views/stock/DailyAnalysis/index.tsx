import React, { useState, useEffect } from 'react';
import { 
  Card, 
  DatePicker, 
  Select, 
  Spin, 
  message, 
  Row, 
  Col, 
  Statistic,
  Radio,
  Divider 
} from 'antd';
import { Line, Column } from '@ant-design/charts';
import dayjs from 'dayjs';
import type { StockDaily } from '@/types';
import { StockDailyAPI } from '@/service/stock/dailyService';

const { RangePicker } = DatePicker;
const { Option } = Select;

const StockDailyAnalysis: React.FC = () => {
  const [stockCode, setStockCode] = useState<string>('600519.SH');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs('2025-09-08').subtract(60, 'day'),
    dayjs('2025-09-08'),
  ]);
  const [adjustflag, setAdjustflag] = useState<string>('2');
  const [chartData, setChartData] = useState<StockDaily[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stockList, setStockList] = useState<Array<{code: string, name: string}>>([]);

  // 获取日线数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0]?.format('YYYY-MM-DD');
      const endDate = dateRange[1]?.format('YYYY-MM-DD');
      
      const [dailyDataList, stockList] = await Promise.all([
        StockDailyAPI.getStockDailyData(stockCode, startDate, endDate, adjustflag),
        StockDailyAPI.getStockList()
      ]);
      setChartData(dailyDataList||[]);
      setStockList(stockList);
    } catch (error) {
      message.error(`数据获取失败: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // 处理图表数据
  const processChartData = (data: StockDaily[]) => {
    return data.map(item => ({
      ...item,
      date: item.date,
      pctChg: (item.close-item.open) / item.open,
      timestamp: new Date(item.date).getTime(),
      change: (item.close-item.open) / item.open,
      isRise: (item.close-item.open) / item.open >= 0,
      volumeFormatted: item.volume / 10000, // 转换为万股
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // 价格走势图配置
  const priceChartConfig = {
    data: processChartData(chartData),
    padding: 'auto' as const,
    xField: 'date',
    yField: 'close',
    tooltip: {
      title:  {field: 'date', valueFormatter: (date:string) => dayjs(date).format('YYYY年MM月DD日')},
      items: [
        { field:'close', name: '收盘价'}
      ],
    },
    axis: {
      x: {
        labelFormatter: (date:string) =>dayjs(date).format('MM-DD'),
        labelFilter: (date:string, index: number, data: string[]|undefined)=> {
          if (!data || data.length === 0) return false;
          const interval = Math.floor(data.length / 15);
          return index === data.length || (interval > 0 && index % interval === 0);
        }
      },
    },
    point: {
      size: 3,
      shape: 'circle',
    },
  };

  // 成交量图配置
  const volumeChartConfig = {
    data: processChartData(chartData),
    padding: 'auto' as const,
    xField: 'date',
    yField: 'volumeFormatted',
    style: {
      fill: ({isRise}:{isRise:boolean}) => {
        return isRise ? '#ef5350':'#26a69a'
      }
    },
    axis: {
      x:{
        title: '日期',
        labelFormatter: (date:string) =>dayjs(date).format('MM-DD'),
        labelFilter: (date:string, index: number, data: string[]|undefined)=> {
          if (!data || data.length === 0) return false;
          const interval = Math.floor(data.length / 8);
          return index === data.length || (interval > 0 && index % interval === 0);
        }
      },
      y: {
         title: '成交量(万股)',
         labelFormatter: (value:number) =>`${value.toFixed(0)}`,
      }
    },
    tooltip: {
      title:  {field: 'date', valueFormatter: (date:string) => dayjs(date).format('YYYY年MM月DD日')},
      items: [
        { field:'volumeFormatted', name: '成交量', valueFormatter: (v:number)=>`${v.toFixed(0)}万股`}
      ],
    },
  };

  const processChartDataColorLine = (data: (StockDaily&{isRise:boolean})[]) => {
    let preFlag = false
    const lon = data.map(stockDaily=> {
      if(preFlag&&stockDaily.isRise==false) {
        return {
          date: stockDaily.date,
          type: 'rising',
          pctChg: stockDaily.pctChg
        }
      }

      preFlag = stockDaily.isRise
      return {
        date: stockDaily.date,
        type: 'rising',
        pctChg: stockDaily.isRise? stockDaily.pctChg: null,
      }
    })

    preFlag = false
    const bor = data.map(stockDaily=> {
      if(preFlag&&stockDaily.isRise==false) {
        return {
          date: stockDaily.date,
          type: 'down',
          pctChg: stockDaily.pctChg
        }
      }

      return {
        date: stockDaily.date,
        type: 'down',
        pctChg: !stockDaily.isRise? stockDaily.pctChg: null,
      }
    })

    const result = lon.concat(bor)
    return result;
  }

  // 涨跌幅图配置
  const changeChartConfig = {
    data: processChartDataColorLine(processChartData(chartData)),
    padding: 'auto' as const,
    xField: 'date',
    yField: 'pctChg',
    scale: {
      color: {
        range: ['#ef5350', '#26a69a'],
      },
    },
    colorField: 'type',
    axis: {
      x:{
        title: '日期',
        labelFormatter: (date:string) =>dayjs(date).format('MM-DD'),
        labelFilter: (date:string, index: number, data: string[]|undefined)=> {
          if (!data || data.length === 0) return false;
          const interval = Math.floor(data.length / 8);
          return index === data.length || (interval > 0 && index % interval === 0);
        }
      },
      y: {
         title: '涨跌幅(%)',
      }
    },
    point: {
      size: 1,
      shape: 'circle',
    },
    legend: false,
    interaction: {
      tooltip: {
        render: (_:any, { title, items }:{title: string, items:{value:number,color: string, name: string}[]}) => {
          const list = items.filter((item) => (item.name=='rising' && item.value > 0)||(item.name=='down' && item.value < 0));
          return (
            <div key={title}>
              <h4>{title}</h4>
              {list.map((item) => {
                const { name, value, color } = item;
                return (
                  <div>
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
                        <span>{name=='rising'?'收涨':'收跌'}</span>
                      </div>
                      <b>{(value*100).toFixed(2)}%</b>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
    },
  };

  // 计算统计数据
  const calculateStats = () => {
    if (chartData.length === 0) return null;

    const closes = chartData.map(d => d.close);
    const changes = chartData.map(d => (d.pctChg||0));
    const volumes = chartData.map(d => d.volume);
    
    return {
      startPrice: closes[0],
      endPrice: closes[closes.length - 1],
      minPrice: Math.min(...closes),
      maxPrice: Math.max(...closes),
      avgChange: changes.reduce((a, b) => a + b, 0) / changes.length,
      totalVolume: volumes.reduce((a, b) => a + b, 0),
      totalAmount: chartData.reduce((sum, d) => sum + d.amount, 0),
      riseDays: changes.filter(change => change > 0).length,
      fallDays: changes.filter(change => change < 0).length,
    };
  };

  const stats = calculateStats();
  const totalChange = stats ? ((stats.endPrice - stats.startPrice) / stats.startPrice) * 100 : 0;

  useEffect(()=>{
    fetchData()
  },[])

  return (
    <div style={{ padding: 24 }}>
      <Card title="股票日线数据分析" variant={"borderless"}>
        {/* 查询条件 */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Select
            value={stockCode}
            onChange={setStockCode}
            style={{ width: 200 }}
            placeholder="选择股票代码"
            loading={stockList.length === 0}
          >
            {stockList.map(stock => (
              <Option key={stock.code} value={stock.code}>
                {stock.name} ({stock.code})
              </Option>
            ))}
          </Select>

          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />

          <Radio.Group value={adjustflag} onChange={(e) => setAdjustflag(e.target.value)}>
            <Radio.Button value="2">前复权</Radio.Button>
          </Radio.Group>

          <button 
            onClick={()=>{fetchData()}}
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
            <div style={{ marginTop: 16 }}>日线数据加载中...</div>
          </div>
        )}

        {/* 图表展示 */}
        {!loading && chartData.length > 0 && (
          <div>
            {/* 统计数据 */}
            {stats && (
              <>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={4}>
                    <Statistic 
                      title="期初价格" 
                      value={stats.startPrice.toFixed(2)} 
                      suffix="元" 
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic 
                      title="期末价格" 
                      value={stats.endPrice.toFixed(2)} 
                      suffix="元" 
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic 
                      title="累计涨跌" 
                      value={totalChange.toFixed(2)} 
                      suffix="%" 
                      valueStyle={{ color: totalChange >= 0 ? '#cf1322' : '#3f8600' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic title="最高价" value={stats.maxPrice.toFixed(2)} suffix="元" />
                  </Col>
                  <Col span={4}>
                    <Statistic title="最低价" value={stats.minPrice.toFixed(2)} suffix="元" />
                  </Col>
                  <Col span={4}>
                    <Statistic title="平均涨跌" value={stats.avgChange.toFixed(2)} suffix="%" />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={4}>
                    <Statistic title="上涨天数" value={stats.riseDays} />
                  </Col>
                  <Col span={4}>
                    <Statistic title="下跌天数" value={stats.fallDays} />
                  </Col>
                  <Col span={4}>
                    <Statistic title="总成交量" value={(stats.totalVolume / 10000).toFixed(0)} suffix="万股" />
                  </Col>
                  <Col span={4}>
                    <Statistic title="总成交额" value={(stats.totalAmount / 10000).toFixed(0)} suffix="万元" />
                  </Col>
                </Row>
                <Divider />
              </>
            )}

            <div style={{ marginBottom: 24 }}>
              <h3>价格走势</h3>
              <Line {...priceChartConfig}  />
            </div>

            <Row gutter={24}>
              <Col span={12}>
                <h3>成交量</h3>
                <Column {...volumeChartConfig} />
              </Col>
              <Col span={12}>
                <h3>涨跌幅</h3>
                <Line {...changeChartConfig} />
              </Col>
            </Row>
          </div>
        )}

        {/* 空状态 */}
        {!loading && chartData.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无日线数据，请选择股票代码和日期范围后查询
          </div>
        )}
      </Card>
    </div>
  );
};

export default StockDailyAnalysis;