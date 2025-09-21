import { delay, http, HttpResponse } from 'msw';
import pagedData from './companyMockData.json'
import type { APIResponseResolver, PageResponse } from '../mockUtils';
import type { APIResponse, CompanyInfo } from '@/types';

const BASE_URL = `${import.meta.env.VITE_MOCK_URL}/api/sec-info`

export const companyMock = [
  http.get(`${BASE_URL}`, (async ({ request, params }) => {
    await delay(500);
    return HttpResponse.json<APIResponse<PageResponse<CompanyInfo>>>({
      code: 200,
      message: '成功',
      data: pagedData,
      timestamp: new Date().getTime()
    });
  })as APIResponseResolver<PageResponse<CompanyInfo>>),
]