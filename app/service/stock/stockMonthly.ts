import type { StockMonthlyData } from "@/types";
import { http as request } from '@/utils/request';

const BASE_URL = '/api/stock-monthly';

export const StockMonthlyAPI = {
  // 获取现金流量数据
  getStockMonthlyData: async (
  code: string,
  startYearMonth: string,
  endYearMonth: string
    ): Promise<StockMonthlyData[]> => {
      const response = await request.get<StockMonthlyData[]>(`${BASE_URL}/code/${code}/year-month-range`,{startYearMonth,endYearMonth});
      return response;
    },
}


