import type { StockMinuteData } from "@/types";
import { http as request } from '@/utils/request';

const BASE_URL = '/api/stock-minute';

export const StockMinuteAPI = {
  // 获取现金流量数据
  getStockMinuteData: async (
  stockCode: string,
  startDate: string,
  endDate: string
    ): Promise<StockMinuteData[]> => {
      const response = await request.get<StockMinuteData[]>(`${BASE_URL}/code/${stockCode}/date-range`,{startDate,endDate});
      return response;
    },
}
