import { delay, http, HttpResponse } from 'msw';
import type { APIResponseResolver } from '../mockUtils';
import type { APIResponse, StockMinuteData } from '@/types';
import data from './StockMinuteMockData.json'

const BASE_URL = `${import.meta.env.VITE_MOCK_URL}/api/stock-minute`

export const stockMinuteMock = [
  http.get(`${BASE_URL}/code/:stockCode/date-range`, (async ({ request, params }) => {
    await delay(500);
    return HttpResponse.json<APIResponse<StockMinuteData[]>>({
      code: 200,
      message: '成功',
      data: data,
      timestamp: new Date().getTime()
    });
  })as APIResponseResolver<StockMinuteData[]>),
]