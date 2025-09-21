import { AreaChartOutlined, BarChartOutlined, LineChartOutlined, StockOutlined } from '@ant-design/icons';


export default {
  path: '/stock',
  name: '股票数据',
  icon: <StockOutlined />,  // 建议使用股票相关图标
  component: './StockData',
  routes: [
    {
      path: '/stock/monthly',
      name: '月度行情',
      icon: <LineChartOutlined />,
    },
    {
      path: '/stock/daily',
      name: '日线数据',
      icon: <AreaChartOutlined />,
    },
    {
      path: '/stock/hourly', 
      name: '分时走势',
      icon: <BarChartOutlined />,
    },
  ],
}