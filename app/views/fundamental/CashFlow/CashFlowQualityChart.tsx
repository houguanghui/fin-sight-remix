import React from 'react';
import { Statistic, Progress, Row, Col, Tag } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import type { CashFlowQuality } from '@/types';

interface CashFlowQualityChartProps {
  qualityData: CashFlowQuality;
}

const CashFlowQualityChart: React.FC<CashFlowQualityChartProps> = ({ qualityData }) => {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <ProCard title="经营现金流质量" bordered>
          <Statistic
            title="经营现金流"
            value={qualityData.operatingCashFlow}
            precision={2}
            valueStyle={{
              color: (qualityData.operatingCashFlow || 0) >= 0 ? '#3f8600' : '#cf1322',
            }}
          />
          <div style={{ marginTop: 16 }}>
            <Tag color={qualityData.operatingVsProfit ? 'green' : 'red'}>
              {qualityData.operatingVsProfit ? '优于净利润' : '低于净利润'}
            </Tag>
          </div>
        </ProCard>
      </Col>

      <Col span={8}>
        <ProCard title="现金收入质量" bordered>
          {qualityData.cashIncomeRatio && (
            <>
              <Progress
                type="circle"
                percent={Math.round((qualityData.cashIncomeRatio || 0) * 100)}
                width={80}
                status={qualityData.cashIncomeRatioGood ? 'success' : 'exception'}
              />
              <div style={{ marginTop: 16 }}>
                <Tag color={qualityData.cashIncomeRatioGood ? 'green' : 'red'}>
                  现金收入比率: {(qualityData.cashIncomeRatio * 100).toFixed(1)}%
                </Tag>
              </div>
            </>
          )}
        </ProCard>
      </Col>

      <Col span={8}>
        <ProCard title="自由现金流" bordered>
          <Statistic
            title="自由现金流"
            value={qualityData.freeCashFlow}
            precision={2}
            valueStyle={{
              color: (qualityData.freeCashFlow || 0) >= 0 ? '#3f8600' : '#cf1322',
            }}
          />
          <div style={{ marginTop: 16 }}>
            <Tag color={qualityData.freeCashFlowPositive ? 'green' : 'red'}>
              {qualityData.freeCashFlowPositive ? '正向现金流' : '负向现金流'}
            </Tag>
          </div>
        </ProCard>
      </Col>
    </Row>
  );
};

export default CashFlowQualityChart;