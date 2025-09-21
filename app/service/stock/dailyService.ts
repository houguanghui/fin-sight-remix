import type { StockDaily } from '@/types';
import { http as request } from '@/utils/request';

const BASE_URL = '/api/stock-daily';

export const StockDailyAPI = {
  // 获取现金流量数据
  getStockDailyData: async (
      stockCode: string,
      startDate: string,
      endDate: string,
      adjustflag: string = '3'
    ): Promise<StockDaily[]> => {
      const response = await request.get<StockDaily[]>(`${BASE_URL}/code/${stockCode}/date-range`,{startDate,endDate,adjustflag});
      return response;
    },

  getStockList: async (
    ): Promise<Array<{code: string, name: string}>> => {
      return [
        { code: '600000.SH', name: '浦发银行' },
        { code: '000001.SZ', name: '平安银行' },
        { code: '600036.SH', name: '招商银行' },
        { code: '601318.SH', name: '中国平安' },
        { code: '600519.SH', name: '贵州茅台' },
        { code: '000858.SZ', name: '五粮液' },
        { code: '000002.SZ', name: '万科A' },
        { code: '600016.SH', name: '民生银行' },
      ];
    },
}