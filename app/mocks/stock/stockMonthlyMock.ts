import { delay, http, HttpResponse } from 'msw';
import type { APIResponseResolver } from '../mockUtils';
import type { APIResponse, StockMonthlyData } from '@/types';
import data from './stockMonthlyMockData.json'

const BASE_URL = `${import.meta.env.VITE_MOCK_URL}/api/stock-monthly`

export const stockMonthlyMock = [
  http.get(`${BASE_URL}/code/:stockCode/year-month-range`, (async ({ request, params }) => {
    await delay(500);
    return HttpResponse.json<APIResponse<StockMonthlyData[]>>({
      code: 200,
      message: '成功',
      data: data,
      timestamp: new Date().getTime()
    });
  })as APIResponseResolver<StockMonthlyData[]>),
]