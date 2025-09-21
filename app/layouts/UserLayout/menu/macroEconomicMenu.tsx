import {
  GlobalOutlined,
  DashboardOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  MoneyCollectOutlined // 新增一个代表货币的图标
} from '@ant-design/icons';

export const macroEconomicMenu = {
  path: '/macro-economic',
  name: '宏观经济',
  icon: <GlobalOutlined />,
  routes: [
    {
      path: '/macro-economic/indicators/gdp',
      name: 'GDP数据',
      icon: <BarChartOutlined />,
    },
    {
      path: '/macro-economic/indicators/cpi',
      name: 'CPI数据',
      icon: <LineChartOutlined />,
    },
    {
      path: '/macro-economic/indicators/ppi',
      name: 'PPI数据',
      icon: <AreaChartOutlined />,
    },
    {
      path: '/macro-economic/indicators/pmi',
      name: 'PMI数据',
      icon: <PieChartOutlined />,
    },
    {
      path: '/macro-economic/indicators/money-supply',
      name: '货币供应量',
      icon: <MoneyCollectOutlined />, // 使用一个代表钱的图标
    }
  ],
};