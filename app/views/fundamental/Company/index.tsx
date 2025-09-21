import React, { useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Typography, Divider, Tag, Descriptions, Space } from 'antd';
import { safeJSONParse } from '@/utils/global';
import type { CompanyInfo } from '@/types';
import { CompanyInfoAPI } from '@/service/fundamental/companyService';

const { Title, Text } = Typography;

const SecInfoManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<CompanyInfo | null>(null);

  const columns: ProColumns<CompanyInfo>[] = [
    {
      title: '股票代码',
      dataIndex: 'stockCode',
      key: 'stockCode',
      copyable: true,
      width: 100,
      fixed: 'left',
    },
    {
      title: '公司简称',
      dataIndex: 'orgShortNameCn',
      key: 'orgShortNameCn',
      width: 100,
    },
    {
      title: '公司全称',
      dataIndex: 'orgNameCn',
      key: 'orgNameCn',
      search: true,
      ellipsis: true,
      width: 200,
    },
    {
      title: '英文名称',
      dataIndex: 'orgNameEn',
      key: 'orgNameEn',
      width: 150,
      ellipsis: true,
    },
    {
      title: '省份',
      dataIndex: 'provincialName',
      key: 'provincialName',
      filters: [
        { text: '江苏省', value: '江苏省' },
        { text: '重庆市', value: '重庆市' },
        { text: '广东省', value: '广东省' },
        { text: '北京市', value: '北京市' },
        { text: '上海市', value: '上海市' },
        { text: '浙江省', value: '浙江省' },
      ],
      width: 80,
    },
    {
      title: '所属行业',
      dataIndex: 'affiliateIndustry',
      key: 'industry',
      width: 120,
      renderText: (text: {indCode: string;indName: string;}, record: CompanyInfo) => {
        return text.indName
      },
    },
    {
      title: '法定代表人',
      dataIndex: 'legalRepresentative',
      key: 'legalRepresentative',
      width: 100,
    },
    {
      title: '注册资本(元)',
      dataIndex: 'regAsset',
      key: 'regAsset',
      width: 120,
      renderText: (text: any, record: CompanyInfo) => 
        record.regAsset ? record.regAsset.toLocaleString('zh-CN') : '-',
    },
    {
      title: '员工人数',
      dataIndex: 'staffNum',
      key: 'staffNum',
      width: 80,
      renderText: (text: any, record: CompanyInfo) => 
        record.staffNum ? record.staffNum.toLocaleString('zh-CN') : '-',
    },
    {
      title: '上市日期',
      dataIndex: 'listedDate',
      valueType: 'date',
      sorter: true,
      key: 'listedDate',
      width: 100,
    },
    {
      title: '企业性质',
      dataIndex: 'classiName',
      key: 'classiName',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'telephone',
      key: 'telephone',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 150,
    },
    {
      title: '网址',
      dataIndex: 'orgWebsite',
      key: 'orgWebsite',
      width: 150,
      renderText: (text: any, record: CompanyInfo) => record.orgWebsite || '-',
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      width: 60,
      fixed: 'right',
      render: (_, record) => [
        <Button 
          key="view" 
          type="link" 
          size="small" 
          onClick={() => handleViewDetail(record)}
        >
          查看
        </Button>,
      ],
    },
  ];

  const handleViewDetail = (record: CompanyInfo) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setCurrentRecord(null);
  };

  const renderDetailModal = () => {
    if (!currentRecord) return null;

    return (
      <Modal
        title="公司详细信息"
        open={detailVisible}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="close" onClick={handleCloseDetail}>
            关闭
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Typography>
          <Title level={4} style={{ marginBottom: 16 }}>
            {currentRecord.orgNameCn}
            <Text type="secondary" style={{ marginLeft: 12, fontSize: 14 }}>
              ({currentRecord.stockCode})
            </Text>
          </Title>

          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="股票代码" span={2}>
              {currentRecord.stockCode}
            </Descriptions.Item>
            <Descriptions.Item label="组织机构ID">
              {currentRecord.orgId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="公司简称">
              {currentRecord.orgShortNameCn || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="英文全称">
              {currentRecord.orgNameEn || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="英文简称">
              {currentRecord.orgShortNameEn || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="省份">
              {currentRecord.provincialName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="企业性质">
              {currentRecord.classiName || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">管理层信息</Divider>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="法定代表人">
              {currentRecord.legalRepresentative || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="总经理">
              {currentRecord.generalManager || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="董事会秘书">
              {currentRecord.secretary || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="董事长">
              {currentRecord.chairman || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="高管人数">
              {currentRecord.executivesNums || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">经营信息</Divider>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="主营业务">
              {currentRecord.mainOperationBusiness || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="经营范围">
              {currentRecord.operatingScope || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="公司介绍">
              {currentRecord.orgCnIntroduction || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">财务信息</Divider>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="注册资本">
              {currentRecord.regAsset ? currentRecord.regAsset.toLocaleString('zh-CN') + ' 元' : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="员工人数">
              {currentRecord.staffNum ? currentRecord.staffNum.toLocaleString('zh-CN') + ' 人' : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="成立日期">
              {currentRecord.establishedDate ? new Date(currentRecord.establishedDate).toLocaleDateString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="上市日期">
              {currentRecord.listedDate ? new Date(currentRecord.listedDate).toLocaleDateString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="货币类型">
              {currentRecord.currency || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">联系信息</Divider>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="联系电话">
              {currentRecord.telephone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="传真">
              {currentRecord.fax || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {currentRecord.email || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="邮编">
              {currentRecord.postcode || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="网址" span={2}>
              {currentRecord.orgWebsite ? (
                <a href={currentRecord.orgWebsite} target="_blank" rel="noopener noreferrer">
                  {currentRecord.orgWebsite}
                </a>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="注册地址" span={2}>
              {currentRecord.regAddressCn || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="办公地址" span={2}>
              {currentRecord.officeAddressCn || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">其他信息</Divider>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="实际控制人">
              {currentRecord.actualController || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="曾用名">
              {currentRecord.preNameCn || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="所属行业">
              {currentRecord.affiliateIndustry ? (
                typeof currentRecord.affiliateIndustry === 'object' ? (
                  <Space>
                    <Tag>{currentRecord.affiliateIndustry.indName}</Tag>
                    <Text type="secondary">({currentRecord.affiliateIndustry.indCode})</Text>
                  </Space>
                ) : (
                  <Text>{currentRecord.affiliateIndustry}</Text>
                )
              ) : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Typography>
      </Modal>
    );
  };

  return (
    <>
      <ProTable<CompanyInfo>
        columns={columns}
        columnsState={{
          defaultValue: {
            // 默认隐藏的字段
            orgNameEn: { show: false },
            legalRepresentative: { show: false },
            regAsset: { show: false },
            staffNum: { show: false },
            classiName: { show: false },
            telephone: { show: false },
            email: { show: false },
            orgWebsite: { show: false }
          }
        }}
        loading={loading}
        request={async (params = {}, sort, filter) => {
          setLoading(true);
          try {
            const { current = 1, pageSize = 10, orgNameCn, ...rest } = params;
            
            // Spring Boot Pageable 格式的请求参数
            const pageableParams: any = {
              page: current - 1, // Spring Boot页码从0开始
              size: pageSize,
            };

            // 添加搜索条件
            if (orgNameCn) {
              pageableParams.orgNameCn = orgNameCn;
            }

            // 添加其他搜索条件
            Object.entries(rest).forEach(([key, value]) => {
              if (value !== undefined && value !== '') {
                pageableParams[key] = value;
              }
            });

            // 修正排序参数处理 - 使用 sortBy 和 direction 分开的参数
            if (sort && Object.keys(sort).length > 0) {
              // 获取第一个排序字段（ProTable通常只支持单字段排序）
              const [sortField, sortDirection] = Object.entries(sort)[0];
              
              // 设置排序参数
              pageableParams.sortBy = sortField;
              pageableParams.direction = sortDirection === 'ascend' ? 'asc' : 'desc';
            } else {
              // 设置默认排序（如果后端需要）
              pageableParams.sortBy = 'id';
              pageableParams.direction = 'asc';
            }

            // 添加筛选条件
            Object.entries(filter).forEach(([key, value]) => {
              if (value) {
                pageableParams[key] = Array.isArray(value) ? value.join(',') : value;
              }
            });
            const [companyInfoList] = await Promise.all([
              CompanyInfoAPI.getCompanyInfoList(pageableParams),
            ]);
            
            // 处理affiliateIndustry字段转换
            companyInfoList.content = companyInfoList.content ? companyInfoList.content.map(value => {
              let affiliateIndustry: any = value.affiliateIndustry;
              affiliateIndustry = safeJSONParse(affiliateIndustry);
              let temp: {indCode: string;indName: string;} = {
                indCode: affiliateIndustry?.ind_code || affiliateIndustry?.indCode,
                indName: affiliateIndustry?.ind_name || affiliateIndustry?.indName
              }
              value.affiliateIndustry = temp;
              return value;
            }) : [];
            
            return {
              data: companyInfoList.content || [],
              total: companyInfoList.totalElements || 0,
              success: true,
            };
          } catch (error) {
            console.error('获取数据失败:', error);
            return {
              data: [],
              total: 0,
              success: false,
            };
          } finally {
            setLoading(false);
          }
        }}

        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSize: 10,
        }}
        search={{
          labelWidth: 'auto',
        }}
        headerTitle="上市公司信息管理"
        scroll={{ x: 1200 }}
        options={{
          setting: true,
          density: true,
          fullScreen: true,
          reload: true,
        }}
      />
      {renderDetailModal()}
    </>
  );
};

export default SecInfoManagement;