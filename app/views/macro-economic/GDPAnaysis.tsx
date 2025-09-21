import type { Returndata } from "@/types/models/Returndata";
import { PageContainer, ProCard, ProTable, type ProColumns } from "@ant-design/pro-components";
import { Alert, Card, Col, DatePicker, Divider, Radio, Result, Row, Segmented, Select, Spin, Statistic } from "antd";
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import quarterOfYear  from 'dayjs/plugin/quarterOfYear';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Column, Line, Pie } from "@ant-design/charts";
import { StatsAnalysisAPI } from "@/service/macro-economic/statsAnalysisService";

dayjs.extend(quarterOfYear);
const { RangePicker } = DatePicker;

// 定义指标类型映射
const INDICATOR_MAP = {
  A0101: '常规统计',
  A0102: '不变价统计'
};

const GDPAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'quarter'),
    dayjs(),
  ]);
  const [currentData, setCurrentData] = useState<Returndata | null>(null);
  const [[columnCode, rowCode, zb], setTableCode] = useState<string[]>(['zb','sj', 'A0102']);
  // const [[columnCode, rowCode, zb], setTableCode] = useState<string[]>(['zb','sj', 'A0102']);
  const [error, setError] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'priceView' | 'yoyGrowthView' | 'momGrowthView'>('priceView');
  const [selectedIndicator, setSelectedIndicator] = useState('A010201'); // 默认选择GDP总值


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

  const fetchData = async () => {
    setLoading(true)
    setError(null);
    try {
      const [currentData] = await Promise.all([
        StatsAnalysisAPI.getAnalysisData(`gdp_${zb}_quarter`,{
          startTime: dayjsToQuarterString(dateRange[0]),
          endTime: dayjsToQuarterString(dateRange[1]),
        }),
      ])
      setCurrentData(currentData)
    } catch (error) {
      console.error('加载数据失败:', error);
      setError(error instanceof Error ? error.message : '数据加载失败');
    } finally {
      setLoading(false);
    }
  }

  // 处理数据为二维表数据
  const processDataToTable = (rawData: Returndata) => {
    if (!rawData?.datanodes || !rawData?.wdnodes||!rawData?.hasdatacount) return [];
    
    const rowDimension = rawData.wdnodes.find(wd => wd.wdcode === rowCode);
    if (!rowDimension) return [];

    return rowDimension.nodes.map(rowNode => {
      const row: Record<string, string> = {
        [rowCode]: rowDimension.nodes.find(c=>c.code==rowNode.code)?.cname || ''
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
  }

  // 处理数据二维表标题数据
  const processDataToTableColumnsMeta = (rawData: Returndata):ProColumns[] =>{
    if (!rawData?.datanodes || !rawData?.wdnodes) return [];
    const metaNode = rawData.wdnodes.find(wd=>wd.wdcode==columnCode)
    const rowkeyNode = rawData.wdnodes.find(wd=>wd.wdcode==rowCode)
    if(!metaNode||!rowkeyNode) return [];
    const firstCol = [{
      title: rowkeyNode.wdname,
      dataIndex: rowkeyNode.wdcode,
      align: 'left' as const
    } as ProColumns]

    const result = metaNode.nodes.map(zbNode=>({
      title: zbNode.cname,
      dataIndex: zbNode.code,
      align: 'center' as const
    }as ProColumns))

    if (result.length > 8) {
      return firstCol.concat(result.slice(result.length-8))
    }

    return firstCol.concat(result)
  }

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
        timeDataMap[timeKey][indicatorWd.valuecode] = node.data.dataValue;
        
        // 添加指标名称映射
        const indicatorInfo = rawData.wdnodes
          .find(wd => wd.wdcode === 'zb')
          ?.nodes.find(n => n.code === indicatorWd.valuecode);
        
        if (indicatorInfo) {
          timeDataMap[timeKey][`${indicatorWd.valuecode}_name`] = indicatorInfo.cname;
        }
      }
    });

    return Object.values(timeDataMap).sort((a, b) => a.time.localeCompare(b.time));
  };

  // 处理数据为柱状图
  const processColumnChartData = (rawData:any[]) => {
    if (!rawData) return [];
    return rawData.flatMap(row=>[
      {
        time: row['time'],
        value: row[`${zb}03`],
        name: row[`${zb}03_name`]
      },
      {
        time: row['time'],
        value: row[`${zb}05`],
        name: row[`${zb}05_name`]
      },
      {
        time: row['time'],
        value: row[`${zb}07`],
        name: row[`${zb}07_name`]
      }
    ])
  }

  // 获取指标列表
  const getIndicatorOptions = () => {
    if (!currentData) return [];
    
    const zbNode = currentData.wdnodes.find(wd => wd.wdcode === 'zb');
    return zbNode?.nodes.filter(node => 
      node.code.startsWith(zb) && 
      !node.code.endsWith('累计') &&
      !node.cname.includes('累计')
    ) || [];
  };

  // 计算增长率
  const calculateGrowthRate = (chartData: any[], indicatorCode: string) => {
    if (chartView == 'yoyGrowthView') {
      if (chartData.length < 5) return undefined;
    }
    if (chartData.length < 2) return undefined;
    
    // const latest = chartData[chartData.length - 1][indicatorCode];
    // const previous = chartData[chartData.length - 2][indicatorCode];
    
    const growthRate = chartData.map((current,index)=>{
      const previous = chartView == 'yoyGrowthView' && index >= 4?chartData[index - 4] : index > 0 && chartView !== 'yoyGrowthView'? chartData[index - 1]:current;
      const raw: Record<string,string|number> = {...current}
      Object.keys(current).forEach(key=>{
        if (typeof current[key] === 'number') {
          raw[key] = ((current[key] - previous[key]) / previous[key]) * 100
          raw[`${key}_name`] = current[`${key}_name`]
        }
      })
      return raw
    })
    if(chartView == 'yoyGrowthView') return growthRate.slice(3)
    return growthRate
    // if (previous && latest) {
    //   return ((latest - previous) / previous) * 100;
    // }
  };

  // 处理产业结构数据
  const processIndustryStructureData = (chartData: any[]) => {
    if (chartData.length === 0) return [];
    
    const latestData = chartData[chartData.length - 1];
    const primary = latestData[`${zb}03`] || 0; // 第一产业
    const secondary = latestData[`${zb}05`] || 0; // 第二产业
    const tertiary = latestData[`${zb}07`] || 0; // 第三产业
    
    const total = primary + secondary + tertiary;
    
    return [
      { name: '第一产业', value: primary, percentage: (primary / total) * 100 },
      { name: '第二产业', value: secondary, percentage: (secondary / total) * 100 },
      { name: '第三产业', value: tertiary, percentage: (tertiary / total) * 100 }
    ];
  };

  const chartData = currentData ? processChartData(currentData) : [];
  const indicatorOptions = getIndicatorOptions();
  const growthRate = calculateGrowthRate(chartData, selectedIndicator);
  const industryData = processIndustryStructureData(chartData);

  useEffect(() => {
    fetchData();
  }, [dateRange, zb]);

  return (
    <PageContainer
      header={{
        title:"GDP分析"
      }}
      extra={[
        <RangePicker
          key="date"
          onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          picker="quarter"
          style={{ width: 300 }}
          defaultValue={dateRange}
        />
      ]}
    >
      <Divider />
      {/* 加载动画 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>GDP数据加载中...</div>
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

      <Card style={{ marginBottom: 24 }}>
        {/* 控制面板 */}
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>统计类型</div>
            <Segmented
              options={[
                { label: 'GDP', value: 'A0101' },
                { label: 'GDP不变价', value: 'A0102' }
              ]}
              value={zb}
              onChange={(value) => {
                if (value == 'A0102') {
                  setTableCode(['zb', 'sj', value as string]);
                } else {
                  setTableCode(['sj', 'zb', value as string]);
                }
                setSelectedIndicator(`${value}01`);
              }}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>图表视图</div>
            <Segmented
              options={[
                { label: '价格分析', value: 'priceView' },
                { label: '同比分析', value: 'yoyGrowthView' },
                { label: '环比分析', value: 'momGrowthView' }
              ]}
              value={chartView}
              onChange={(value) => setChartView(value as 'priceView' | 'yoyGrowthView' | 'momGrowthView')}
            />
          </Col>
          {indicatorOptions.length > 0 && (
            <Col span={8}>
              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>选择指标</div>
              <Select
                value={selectedIndicator}
                onChange={setSelectedIndicator}
                style={{ width: 200, marginRight: 16 }}
                loading={loading}
                options={indicatorOptions.map(opt => ({
                  label: opt.cname,
                  value: opt.code
                }))}/>
            </Col>
          )}
        </Row>
      </Card>

      {/* 图表区域 */}
      {!loading && currentData && (
        <>
          {/* 卡片区域 */}
          {chartData.length > 0 && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title={chartData[chartData.length - 1][`${selectedIndicator}_name`]}
                  value={chartData[chartData.length - 1][selectedIndicator]}
                  precision={2}
                  suffix="亿元"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title={chartData[chartData.length - 1][`${selectedIndicator}_name`]}
                  value={growthRate&&growthRate[growthRate.length-1][selectedIndicator]}
                  precision={2}
                  valueStyle={{ color: growthRate&&(growthRate[growthRate.length-1][selectedIndicator] as number) >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={ growthRate&&(growthRate[growthRate.length-1][selectedIndicator] as number) >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="数据期间"
                  value={chartData.length}
                  suffix="个季度"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="统计类型"
                  value={INDICATOR_MAP[zb as keyof typeof INDICATOR_MAP]}
                />
              </Card>
            </Col>
          </Row>
          )}
          <Divider />
          
          {/* 绘图区域 */}
          {chartData.length > 0 && (
          <Row gutter={16}>
            <Col xs={24} lg={8}>
              <ProCard title={`GDP结构分析(价格)`} headerBordered>
                <Pie height={300} data={industryData} angleField={'value'} colorField={'name'} label={{text:'value',style: {fontWeight: 'bold'}}}/>
              </ProCard>
            </Col>
            <Col xs={24} lg={8}>
              <ProCard title={`GDP走势分析(${chartView=='priceView'?'价格':chartView=='momGrowthView'?'环比':'同比'})`} headerBordered>
                <Line height={300} data={chartView=='priceView'?chartData:growthRate} xField={'time'} yField={selectedIndicator} colorField={`${selectedIndicator}_name`} shapeField={'smooth'}/>
              </ProCard>
            </Col>
            <Col xs={24} lg={8}>
              <ProCard title={`GDP对比分析(${chartView=='priceView'?'价格':chartView=='momGrowthView'?'环比':'同比'})`} headerBordered>
                <Column height={300} group={{padding: 0}} colorField={'name'} data={chartView=='priceView'?processColumnChartData(chartData):processColumnChartData(growthRate||[])} xField={'time'} yField={'value'}/>
              </ProCard>
            </Col>
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
            />
          </ProCard>
        </>
      )}
    </PageContainer>
  )
}

export default GDPAnalysis