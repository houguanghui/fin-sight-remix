import type { PageDTO, BalanceSheet } from "@/types";
import { http as request } from '@/utils/request';

const BASE_URL = '/api/balance-sheet';

export const BalanceSheetAPI = {
  getBalanceSheetByDateRange: async (
      secucode: string,
      startDate: string,
      endDate: string
    ): Promise<PageDTO<BalanceSheet>> => {
      const response = await request.get<PageDTO<BalanceSheet>>(`${BASE_URL}/secucode/${secucode}/date-range`, {startDate, endDate});
      return response;
    },
}