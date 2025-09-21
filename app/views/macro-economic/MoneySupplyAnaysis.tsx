import type { Returndata } from "@/types/models/Returndata";
import { PageContainer, ProCard, ProTable, type ProColumns } from "@ant-design/pro-components";
import { Alert, Card, Col, DatePicker, Divider, Radio, Result, Row, Segmented, Select, Spin, Statistic, Typography } from "antd";
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Column, Line, Pie, DualAxes } from "@ant-design/charts";
import { StatsAnalysisAPI } from "@/service/macro-economic/statsAnalysisService";

dayjs.extend(quarterOfYear);
const { RangePicker } = DatePicker;
const { Title } = Typography;

const MoneySupplyAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(5, 'year'),
    dayjs(),
  ]);
  const [currentData, setCurrentData] = useState<Returndata | null>(null);
  const [m2Data, setM2Data] = useState<Returndata | null>(null);
  const [gdpData, setGdpData] = useState<Returndata | null>(null);
  const [[columnCode, rowCode, metric], setMetric] = useState<string[]>(['zb', 'sj', 'hbgy_A0D01_month']);
  const [chartView, setChartView] = useState<'absoluteView' | 'yoyGrowthView' | 'momGrowthView'>('absoluteView');
  const [selectedIndicator, setSelectedIndicator] = useState<string | undefined>('A0D0101');
  const [dataType, setDataType] = useState<'money_supply' | 'gdp'>('money_supply');
  const [gdpDataType, setGdpDataType] = useState<'year' | 'quarter'>('year');

  // 货币供应量指标映射
  const moneySupplyIndicators = {
    'A0D0101': '货币和准货币(M2)',
    'A0D0102': '货币(M1)',
    'A0D0103': '流通中现金(M0)',
    'A0D0104': '活期存款',
    'A0D0105': '准货币',
    'A0D0106': '定期存款',
    'A0D0107': '储蓄存款',
    'A0D0108': '其他存款'
  };

  // GDP指标映射 - 年度
  const gdpYearIndicators = {
    'A020101': '国内生产总值',
    'A020102': '第一产业',
    'A020103': '第二产业', 
    'A020104': '第三产业',
    'A020105': '人均国内生产总值'
  };

  // GDP指标映射 - 季度
  const gdpQuarterIndicators = {
    'A010201': '国内生产总值',
    'A010202': '第一产业',
    'A010203': '第二产业',
    'A010204': '第三产业',
    'A010205': '农林牧渔业',
    'A010206': '工业',
    'A010207': '建筑业',
    'A010208': '批发和零售业',
    'A010209': '交通运输、仓储和邮政业',
    'A010210': '住宿和餐饮业',
    'A010211': '金融业',
    'A010212': '房地产业',
    'A010213': '信息传输、软件和信息技术服务业',
    'A010214': '租赁和商务服务业',
    'A010215': '其他行业'
  };

  // 获取当前GDP指标映射
  const getCurrentGdpIndicators = () => {
    return gdpDataType === 'year' ? gdpYearIndicators : gdpQuarterIndicators;
  };

  // 获取主要GDP指标代码
  const getMainGdpIndicatorCode = () => {
    return gdpDataType === 'year' ? 'A020101' : 'A010201';
  };

  const dayjsToMonthString = (date: dayjs.Dayjs) => {
    return `${date.year()}${date.format('MM')}`;
  };

  const dayjsToYearString = (date: dayjs.Dayjs) => {
    return `${date.year()}`;
  };

   const dayjsToQuarterString = (date:dayjs.Dayjs) => {
    switch (date.quarter()) {
      case 1:
        return `${date.year()}A`
      case 2:
        return `${date.year()}B`
      case 3:
        return `${date.year()}C`
      case 4:
        return `${date.year()}D`
      default:
        console.error("季度格式不正确",date.quarter())
        throw new Error("季度格式不正确")
    }
  }

  // 根据指标类型获取时间格式
  const getTimeFormat = (metricType: string) => {
    if (metricType.includes('month')) return 'month';
    if (metricType.includes('quarter')) return 'quarter';
    if (metricType.includes('year')) return 'year';
    return 'month';
  };

  // 根据指标类型格式化时间
  const formatTime = (date: dayjs.Dayjs, metricType: string) => {
    if (metricType.includes('month')) return dayjsToMonthString(date);
    if (metricType.includes('quarter')) return dayjsToQuarterString(date);
    if (metricType.includes('year')) return dayjsToYearString(date);
    return dayjsToMonthString(date);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [currentDataResult, gdpDataResult] = await Promise.all([
        StatsAnalysisAPI.getAnalysisData(metric, {
          startTime: formatTime(dateRange[0], metric),
          endTime: formatTime(dateRange[1], metric),
        }),
        // 获取年度GDP数据用于计算M2/GDP比率（仅在货币供应量模式下需要）
        dataType === 'money_supply' ? StatsAnalysisAPI.getAnalysisData('gdp_A0201_year', {
          startTime: dayjsToYearString(dateRange[0]),
          endTime: dayjsToYearString(dateRange[1]),
        }) : Promise.resolve(null)
      ]);

      setCurrentData(currentDataResult);
      setGdpData(gdpDataResult);

      // 单独获取M2数据用于特殊图表展示（仅在货币供应量模式下）
      if (dataType === 'money_supply' && currentDataResult && currentDataResult.datanodes) {
        const m2Nodes = currentDataResult.datanodes.filter(node => 
          node.wds.some(wd => wd.wdcode === 'zb' && wd.valuecode === 'A0D0101')
        );
        setM2Data({
          ...currentDataResult,
          datanodes: m2Nodes
        });
      } else {
        setM2Data(null);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      setError(error instanceof Error ? error.message : '数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取指标列表
  const getIndicatorOptions = () => {
    if (!currentData) return [];

    const zbNode = currentData.wdnodes.find(wd => wd.wdcode === 'zb');
    return zbNode?.nodes || [];
  };

  // 获取当前指标的显示名称
  const getIndicatorName = (code: string | undefined) => {
    if (!code) return '';
    
    if (dataType === 'money_supply') {
      return moneySupplyIndicators[code as keyof typeof moneySupplyIndicators] || code;
    } else {
      const gdpIndicators = getCurrentGdpIndicators();
      return gdpIndicators[code as keyof typeof gdpIndicators] || code;
    }
  };

  // 处理数据二维表标题数据
  const processDataToTableColumnsMeta = (rawData: Returndata): ProColumns[] => {
    if (!rawData?.datanodes || !rawData?.wdnodes) return [];
    const metaNode = rawData.wdnodes.find(wd => wd.wdcode === columnCode);
    const rowkeyNode = rawData.wdnodes.find(wd => wd.wdcode === rowCode);
    if (!metaNode || !rowkeyNode) return [];
    
    const firstCol = [{
      title: rowkeyNode.wdname,
      dataIndex: rowkeyNode.wdcode,
      align: 'left' as const
    } as ProColumns];

    const result = metaNode.nodes.map(zbNode => ({
      title: zbNode.cname,
      dataIndex: zbNode.code,
      align: 'center' as const,
      render: (text: any) => text ? Number(text).toLocaleString() : '-'
    } as ProColumns));

    if (result.length > 12) {
      return firstCol.concat(result.slice(result.length - 12));
    }

    return firstCol.concat(result);
  };

  // 处理数据为二维表数据
  const processDataToTable = (rawData: Returndata) => {
    if (!rawData?.datanodes || !rawData?.wdnodes || !rawData?.hasdatacount) return [];
    
    const rowDimension = rawData.wdnodes.find(wd => wd.wdcode === rowCode);
    if (!rowDimension) return [];

    return rowDimension.nodes.map(rowNode => {
      const row: Record<string, string> = {
        [rowCode]: rowDimension.nodes.find(c => c.code === rowNode.code)?.cname || ''
      };
      
      const relevantData = rawData.datanodes.filter(dnode =>
        dnode.wds.some(wd => wd.wdcode === rowCode && wd.valuecode === rowNode.code)
      );
      
      relevantData.forEach(dnode => {
        const column = dnode.wds.find(wd => wd.wdcode === columnCode);
        if (column) {
          row[column.valuecode] = dnode.data.strdata;
        }
      });
      
      return row;
    });
  };

  // 处理数据为图表格式
  const processChartData = (rawData: Returndata) => {
    if (!rawData?.datanodes) return [];

    const timeDataMap: Record<string, any> = {};

    rawData.datanodes.forEach(node => {
      const timeWd = node.wds.find(wd => wd.wdcode === 'sj');
      const indicatorWd = node.wds.find(wd => wd.wdcode === 'zb');

      if (timeWd && indicatorWd) {
        const timeKey = timeWd.valuecode;
        if (!timeDataMap[timeKey]) {
          timeDataMap[timeKey] = { time: timeKey };
        }
        
        // 转换为适当的单位
        const value = dataType === 'money_supply' ? node.data.dataValue / 10000 : node.data.dataValue;
        timeDataMap[timeKey][indicatorWd.valuecode] = value;
        
        // 添加指标名称映射
        const indicatorInfo = rawData.wdnodes
          .find(wd => wd.wdcode === 'zb')
          ?.nodes.find(n => n.code === indicatorWd.valuecode);
        
        if (indicatorInfo) {
          timeDataMap[timeKey][`${indicatorWd.valuecode}_name`] = indicatorInfo.cname;
        }
      }
    });
    
    const result = Object.values(timeDataMap).sort((a, b) => a.time.localeCompare(b.time));
    return result;
  };

  // 处理M2/GDP比率数据（仅货币供应量模式有效）
  const processM2GDPRatioData = (moneyData: any[], gdpData: Returndata | null) => {
    if (dataType !== 'money_supply' || !moneyData.length || !gdpData?.datanodes) return [];
    
    const gdpMap: Record<string, number> = {};
    
    // 处理GDP数据
    gdpData.datanodes.forEach(node => {
      const timeWd = node.wds.find(wd => wd.wdcode === 'sj');
      const indicatorWd = node.wds.find(wd => wd.wdcode === 'zb');
      
      if (timeWd && indicatorWd && indicatorWd.valuecode === 'A020101') {
        // 转换为万亿元
        gdpMap[timeWd.valuecode] = node.data.dataValue / 100000000;
      }
    });
    
    // 计算M2/GDP比率
    return moneyData
      .filter(item => {
        // 将月度时间转换为年度格式进行比较
        const year = item.time.substring(0, 4);
        return year in gdpMap;
      })
      .map(item => {
        const year = item.time.substring(0, 4);
        return {
          time: item.time,
          ratio: (item.A0D0101 / gdpMap[year]) * 100 // M2/GDP比率（百分比）
        };
      });
  };

  // 处理数据为结构堆叠面积图（仅货币供应量模式有效）
  const processStructureChartData = (rawData: any[]) => {
    if (dataType !== 'money_supply' || !rawData.length) return [];
    
    const structureKeys = ['A0D0102', 'A0D0105']; // M1和准货币
    return rawData.flatMap(item => 
      structureKeys.map(key => ({
        time: item.time,
        value: item[key],
        category: moneySupplyIndicators[key as keyof typeof moneySupplyIndicators] || key
      }))
    );
  };

  // 计算增长率
  const calculateGrowthRate = (chartData: any[]) => {
    if (chartData.length < 2) return [];
    
    return chartData.map((current, index) => {
      if (index === 0) return { ...current };
      
      let previous;
      if (dataType === 'money_supply') {
        previous = chartView === 'yoyGrowthView' && index >= 12 ? 
          chartData[index - 12] : 
          chartData[index - 1];
      } else {
        // GDP数据使用同比（年度数据）或同比/环比（季度数据）
        const isQuarterly = gdpDataType === 'quarter';
        previous = (chartView === 'yoyGrowthView' || !isQuarterly) && index >= 4 ? 
          chartData[index - 4] : 
          index > 0 ? chartData[index - 1] : current;
      }
      
      const result: Record<string, any> = { time: current.time };
      
      Object.keys(current).forEach(key => {
        if (typeof current[key] === 'number' && typeof previous[key] === 'number') {
          result[key] = ((current[key] - previous[key]) / previous[key]) * 100;
          result[`${key}_name`] = current[`${key}_name`];
        }
      });
      
      return result;
    }).filter(item => Object.keys(item).length > 1);
  };

  const indicatorOptions = getIndicatorOptions();
  const chartData = currentData ? processChartData(currentData) : [];
  const growthRateData = calculateGrowthRate(chartData);
  const displayData = chartView === 'absoluteView' ? chartData : growthRateData;
  const m2GdpRatioData = processM2GDPRatioData(chartData, gdpData);
  const structureData = processStructureChartData(chartData);
  const hasM2GdpData = m2GdpRatioData.length > 0;
  const hasStructureData = structureData.length > 0;

  useEffect(() => {
    fetchData();
  }, [dateRange, metric, dataType]);

  useEffect(() => {
    // 当数据类型变化时，重置选择指标
    if (dataType === 'money_supply') {
      setSelectedIndicator('A0D0101');
      setGdpDataType('year');
    } else if (dataType === 'gdp') {
      // 根据metric设置GDP数据类型
      const newGdpType = metric.includes('quarter') ? 'quarter' : 'year';
      setGdpDataType(newGdpType);
      setSelectedIndicator(newGdpType === 'year' ? 'A020101' : 'A010201');
    }
  }, [dataType, metric]);

  // 处理统计类型切换
  const handleMetricChange = (value: string) => {
    setMetric(['zb', 'sj', value as string]);
    const newDataType = value.includes('hbgy') ? 'money_supply' : 'gdp';
    setDataType(newDataType);
    
    // 设置GDP数据类型
    if (newDataType === 'gdp') {
      const newGdpType = value.includes('quarter') ? 'quarter' : 'year';
      setGdpDataType(newGdpType);
    }
  };

  return (
    <PageContainer
      header={{
        title: dataType === 'money_supply' ? "货币供应量分析" : "GDP分析",
        extra: [
          <RangePicker
            key="date"
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            picker={getTimeFormat(metric)}
            style={{ width: 300 }}
            value={dateRange}
          />
        ]
      }}
    >
      <Divider />
      
      {/* 加载动画 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>数据加载中...</div>
        </div>
      )}

      {/* 错误提示 */}
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

      {/* 空数据提示 */}
      {!loading && !currentData && (
        <Alert
          message="暂无数据"
          description="请选择查看其他时间节点数据"
          type="info"
          showIcon
        />
      )}
      
      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>统计类型</div>
            <Segmented
              options={[
                { label: '货币供应量月度', value: 'hbgy_A0D01_month' },
                { label: 'GDP年度', value: 'gdp_A0201_year' },
                { label: 'GDP季度', value: 'gdp_A0102_quarter' },
              ]}
              value={metric}
              onChange={handleMetricChange}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>图表视图</div>
            <Segmented
              options={[
                { label: '绝对值', value: 'absoluteView' },
                { label: '同比', value: 'yoyGrowthView' },
                ...(dataType === 'money_supply' || gdpDataType === 'quarter' ? [{ label: '环比', value: 'momGrowthView' }] : [])
              ]}
              value={chartView}
              onChange={(value) => setChartView(value as any)}
            />
          </Col>
          {indicatorOptions.length > 0 && (
            <Col span={8}>
              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>选择指标</div>
              <Select
                value={selectedIndicator}
                onChange={setSelectedIndicator}
                style={{ width: 200 }}
                loading={loading}
                options={indicatorOptions.map(opt => ({
                  label: opt.cname,
                  value: opt.code
                }))}
              />
            </Col>
          )}
        </Row>
      </Card>

      {/* 图表区域 */}
      {!loading && currentData && (
        <>
          {/* 关键指标卡片 */}
          {displayData.length > 0 && selectedIndicator && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title={getIndicatorName(selectedIndicator)}
                    value={displayData[displayData.length - 1][selectedIndicator]}
                    precision={chartView === 'absoluteView' ? 2 : 1}
                    suffix={chartView === 'absoluteView' ? (dataType === 'money_supply' ? '万亿元' : '亿元') : '%'}
                  />
                </Card>
              </Col>
              {growthRateData.length > 0 && (
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={`较${chartView === 'yoyGrowthView' ? '上年同期' : '上期'}变化`}
                      value={growthRateData[growthRateData.length - 1][selectedIndicator]}
                      precision={1}
                      valueStyle={{ 
                        color: (growthRateData[growthRateData.length - 1][selectedIndicator] as number) >= 0 ? 
                        '#3f8600' : '#cf1322' 
                      }}
                      prefix={(growthRateData[growthRateData.length - 1][selectedIndicator] as number) >= 0 ? 
                        <ArrowUpOutlined /> : <ArrowDownOutlined />
                      }
                      suffix="%"
                    />
                  </Card>
                </Col>
              )}
              <Col span={6}>
                <Card>
                  <Statistic
                    title="数据期间"
                    value={displayData.length}
                    suffix={metric.includes('month') ? '个月' : metric.includes('quarter') ? '个季度' : '年'}
                  />
                </Card>
              </Col>
              {dataType === 'money_supply' && hasM2GdpData && (
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="最新M2/GDP比率"
                      value={m2GdpRatioData[m2GdpRatioData.length - 1].ratio}
                      precision={1}
                      suffix="%"
                    />
                  </Card>
                </Col>
              )}
            </Row>
          )}
          
          <Divider />
          
          {/* 主要趋势图 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <ProCard title={dataType === 'money_supply' ? "货币供应量趋势" : "GDP趋势"} headerBordered>
                <Line 
                  height={400} 
                  data={displayData.map(item => ({
                    time: item.time,
                    value: item[selectedIndicator || ''],
                    category: getIndicatorName(selectedIndicator)
                  }))} 
                  xField="time" 
                  yField="value" 
                  seriesField="category"
                  smooth
                  yAxis={{
                    label: {
                      formatter: (v:number) => `${v}${chartView === 'absoluteView' ? (dataType === 'money_supply' ? '万亿元' : '亿元') : '%'}`
                    }
                  }}
                />
              </ProCard>
            </Col>
          </Row>
          
          {/* 货币供应量专属图表 */}
          {dataType === 'money_supply' && (
            <Row gutter={16}>
              {/* 货币结构分析 */}
              {hasStructureData && (
                <Col xs={24} lg={12}>
                  <ProCard title="货币供应量结构" headerBordered>
                    <Column 
                      height={300} 
                      isStack
                      data={structureData}
                      xField="time" 
                      yField="value" 
                      colorField="category"
                      legend={{ position: 'top' }}
                      yAxis={{
                        label: {
                          formatter: (v:number) => `${v}万亿元`
                        }
                      }}
                    />
                  </ProCard>
                </Col>
              )}
              
              {/* M2/GDP比率 */}
              {hasM2GdpData && (
                <Col xs={24} lg={hasStructureData ? 12 : 24}>
                  <ProCard title="M2/GDP比率" headerBordered>
                    <Line 
                      height={300} 
                      data={m2GdpRatioData} 
                      xField="time" 
                      yField="ratio"
                      yAxis={{
                        label: {
                          formatter: (v:number) => `${v}%`
                        }
                      }}
                    />
                  </ProCard>
                </Col>
              )}
            </Row>
          )}
          
          {/* 数据表格 */}
          <ProCard title="详细数据" style={{ marginTop: 24 }} headerBordered>
            <ProTable<any>
              columns={processDataToTableColumnsMeta(currentData)}
              dataSource={processDataToTable(currentData)}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              rowKey={rowCode}
              search={false}
              scroll={{ x: 'max-content' }}
            />
          </ProCard>
        </>
      )}
    </PageContainer>
  );
};

export default MoneySupplyAnalysis;