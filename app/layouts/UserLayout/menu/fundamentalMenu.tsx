import {
  DatabaseOutlined,
  AccountBookOutlined, // 资产负债表
  RiseOutlined,        // 利润表
  FundOutlined,        // 现金流量表
  TeamOutlined,        // 股东信息（新图标）
  BulbOutlined,        // 公司概况（新图标）
  BankOutlined,
} from '@ant-design/icons';

export default {
  path: '/fundamental',
  name: '基本面数据',
  icon: <DatabaseOutlined />,
  routes: [
    // 将三大报表提升为二级菜单
    {
      path: '/fundamental/balance-sheet',
      name: '资产负债表',
      icon: <AccountBookOutlined />,
    },
    {
      path: '/fundamental/income-statement',
      name: '利润表',
      icon: <RiseOutlined />,
    },
    {
      path: '/fundamental/cash-flow',
      name: '现金流量表',
      icon: <FundOutlined />,
    },
    // 扩充并重命名“公司信息”类别
    {
      path: '/fundamental/company/overview',
      name: '公司概况',
      icon: <BankOutlined />,
    },
  ],
}