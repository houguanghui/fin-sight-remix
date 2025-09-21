import { http, HttpResponse } from "msw";
import cashFlowData from './cashFlowMockData/data.json'
import cashFlowHealth from './cashFlowMockData/health.json'
import cashFlowQuality from './cashFlowMockData/quality.json'
import cashFlowTrend from './cashFlowMockData/trend.json'
import cashFlowCompare from './cashFlowMockData/compare.json'
import type { APIResponse, CashFlow, CashFlowHealth, CashFlowQuality, CashFlowTrend } from "@/types";
import type { APIResponseResolver } from "../mockUtils";

const BASE_URL = `${import.meta.env.VITE_MOCK_URL}/api/cash-flow`

export const cashFlowMock = [
  http.post(`${BASE_URL}/compare`, (async ({ request, params }) => {
    const newPost =  await request.clone().json()

    return HttpResponse.json<APIResponse<any>>({
      code: 200,
      message: '成功',
      data: cashFlowCompare,
      timestamp: new Date().getTime()
    });
  }) as APIResponseResolver<any>),

  http.get(`${BASE_URL}/:secucode`, (async ({ request, params }) => {
    const url = new URL(request.url);
    const { secucode } = params;
    // 查询参数
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    return HttpResponse.json<APIResponse<CashFlow[]>>({
      code: 200,
      message: '成功',
      data: cashFlowData,
      timestamp: new Date().getTime()
    });
   }) as APIResponseResolver<CashFlow[]>),

  http.get(`${BASE_URL}/:secucode/health`, (async ({ request, params }) => {
    const url = new URL(request.url);
    const { secucode } = params;
    // 查询参数
    const startDate = url.searchParams.get('reportDate');

    return HttpResponse.json<APIResponse<CashFlowHealth>>({
      code: 200,
      message: '成功',
      data: cashFlowHealth,
      timestamp: new Date().getTime()
    });
   }) as APIResponseResolver<CashFlowHealth>),

  http.get(`${BASE_URL}/:secucode/trend`, (async ({ request, params }) => {
    const url = new URL(request.url);
    const { secucode } = params;
    // 查询参数
    const year = url.searchParams.get('years');

    return HttpResponse.json<APIResponse<CashFlowTrend>>({
      code: 200,
      message: '成功',
      data: cashFlowTrend,
      timestamp: new Date().getTime()
    });
  }) as APIResponseResolver<CashFlowTrend>),

  http.get(`${BASE_URL}/:secucode/quality`, (async ({ request, params }) => {
    const url = new URL(request.url);
    const { secucode } = params;
    // 查询参数
    const reportDate = url.searchParams.get('reportDate');

    return HttpResponse.json<APIResponse<CashFlowQuality>>({
      code: 200,
      message: '成功',
      data: cashFlowQuality,
      timestamp: new Date().getTime()
    });
  }) as APIResponseResolver<CashFlowQuality>),
]