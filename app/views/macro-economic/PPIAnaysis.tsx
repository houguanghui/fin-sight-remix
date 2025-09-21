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

const PPIAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(3, 'year'),
    dayjs(),
  ]);
  const [currentData, setCurrentData] = useState<Returndata | null>(null);
  const [[columnCode, rowCode, salesMetric], setTableCode] = useState<string[]>(['zb','sj', 'ppi_A010807_month']);
  const [chartView, setChartView] = useState<'yoyGrowthView' | 'momGrowthView'>('momGrowthView');
  const [selectedIndicator, setSelectedIndicator] = useState<string|undefined>(salesMetric=='ppi_A010807_month'?'A01080701':'A090105'); // 居民消费价格指数(上月=100)


  const dayjsToMonthString = (date:dayjs.Dayjs) => {
    return `${date.year()}${date.format('MM')}`
  }

  const dayjsToYearString = (date:dayjs.Dayjs) => {
    return `${date.year()}`
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null);
    try {
      const [currentData] = await Promise.all([
        StatsAnalysisAPI.getAnalysisData(salesMetric,{
          startTime: salesMetric=='ppi_A010807_month'?dayjsToMonthString(dateRange[0]):dayjsToYearString(dateRange[0]),
          endTime: salesMetric=='ppi_A010807_month'?dayjsToMonthString(dateRange[1]):dayjsToYearString(dateRange[1]),
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

    // 获取指标列表
  const getIndicatorOptions = () => {
    if (!currentData) return [];

    const zbNode = currentData.wdnodes.find(wd => wd.wdcode === 'zb');
    return zbNode?.nodes || [];
  };

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

    if (result.length > 11) {
      return firstCol.concat(result.slice(result.length-12))
    }

    return firstCol.concat(result)
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
    const result = Object.values(timeDataMap).sort((a, b) => a.time.localeCompare(b.time))
    return result;
  };

  // 处理数据为柱状图
  const processColumnChartData = (rawData:Record<string,string|number>[]) => {
    if (!rawData||rawData.length == 0) return [];
    const firstNode = rawData[0]
    let keys = Object.keys(firstNode).filter(key=>(typeof firstNode[key]) == 'number')
    keys = keys.length > 5 ? keys.slice(0,5): keys

    const result = rawData.flatMap(row=>keys.map(key=>({
        time: row['time'],
        value: row[key],
        name: row[`${key}_name`]
    })))
    
    return result;
  }


  // 处理数据为折线图
  const processLineChartData =  (rawData:Record<string,string|number>[]) => {
    if (!rawData||rawData.length == 0) return [];
    const firstNode = rawData[0]
    let keys = Object.keys(firstNode).filter(key=>(typeof firstNode[key]) == 'number')

    const result = rawData.flatMap(row=>keys.map(key=>({
        time: row['time'],
        value: row[key],
        name: row[`${key}_name`]
    })))
    
    return result;
  }

  // 计算增长率
  const calculateGrowthRate = (chartData: any[]) => {
    if (chartView == 'yoyGrowthView'&&selectedIndicator=='ppi_A010807_month') {
      if (chartData.length < 5) return undefined;
    }
    if (chartData.length < 2) return undefined;
    
    const growthRate = chartData.map((current,index)=>{
      const previous = chartView == 'yoyGrowthView' &&selectedIndicator=='ppi_A010807_month' && index >= 4?chartData[index - 4] : index > 0 && (chartView !== 'yoyGrowthView'||selectedIndicator!=='ppi_A010807_month')? chartData[index - 1]:current;
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
  };

  const indicatorOptions = getIndicatorOptions();
  const chartData = currentData ? processChartData(currentData) : [];
  const growthRate = calculateGrowthRate(chartData);
  useEffect(() => {
    fetchData();
  }, [dateRange, salesMetric]);
  
  return (
    <PageContainer
      header={{
        title:"CPI分析"
      }}
      extra={[
        <RangePicker
          key="date"
          onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          picker={salesMetric=='ppi_A010807_month'?'month':'year'}
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

      
      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>统计类型</div>
            <Segmented
              options={[
                { label: 'PPI月度', value: 'ppi_A010807_month' },
                { label: 'PPI年度', value: 'ppi_A0901_year' },
              ]}
              value={salesMetric}
              onChange={(value) => {
                setTableCode(['zb', 'sj', value as string]);
                setSelectedIndicator(value=='ppi_A010807_month'?'A01080701':'A090105')
              }}
            />
          </Col>
          <Col span={8}>
          {
            salesMetric=='ppi_A010807_month' && (
              <>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>图表视图</div>
                <Segmented
                  options={[
                    { label: '环比分析', value: 'momGrowthView' },
                    { label: '同比分析', value: 'yoyGrowthView' }
                  ]}
                  value={chartView}
                  onChange={(value) => setChartView(value as 'yoyGrowthView' | 'momGrowthView')}
                />
              </>
            )
          }
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
          {chartData.length > 0 && selectedIndicator &&  (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title={chartData[chartData.length - 1][`${selectedIndicator}_name`]}
                  value={chartData[chartData.length - 1][selectedIndicator]}
                  precision={2}
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
                  suffix={salesMetric=='ppi_A010807_month'?'个月':'年'}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="统计类型"
                  value={"指数统计较上次情况"}
                />
              </Card>
            </Col>
          </Row>
          )}
          <Divider />

          {/* 绘图区域 */}
          {chartData.length > 0 && (
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <ProCard title={`PPI走势分析`} headerBordered>
                <Line height={300} data={processLineChartData(growthRate||[])} xField={'time'} yField={'value'} colorField={'name'} shapeField={'smooth'}/>
              </ProCard>
            </Col>
            <Col xs={24} lg={12}>
              <ProCard title={`PPI对比分析`} headerBordered>
                <Column height={300} group={{padding: 0}} colorField={'name'} data={processColumnChartData(growthRate||[])} xField={'time'} yField={'value'}/>
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

export default PPIAnalysis


