import { http, HttpResponse } from "msw"
import type { APIResponseResolver } from "../mockUtils"
import profitAnalysisHistory from './profitMockData/history.json';
import profitAnalysisGrowth from './profitMockData/growth.json';
import profitAnalysisProfitability from './profitMockData/profitability.json';
import type { APIResponse, GrowthAnalysisDTO, ProfitabilityAnalysisDTO, ProfitAnalysis } from "@/types";

const BASE_URL = `${import.meta.env.VITE_MOCK_URL}/api/profit-analysis`

export const profitMock = [
   http.get(`${BASE_URL}/history/:secucode`, (async ({ request, params }) => {
    const { secucode } = params;
    return HttpResponse.json<APIResponse<ProfitAnalysis[]>>({
      code: 200,
      message: '成功',
      data: profitAnalysisHistory,
      timestamp: new Date().getTime()
    });
   }) as APIResponseResolver<ProfitAnalysis[]>),

  http.get(`${BASE_URL}/growth/:secucode`, (async ({ request, params }) => {
    const url = new URL(request.url);
    const { secucode } = params;
    // 查询参数
    const year = url.searchParams.get('years');

    return HttpResponse.json<APIResponse<GrowthAnalysisDTO[]>>({
      code: 200,
      message: '成功',
      data: profitAnalysisGrowth,
      timestamp: new Date().getTime()
    });
   }) as APIResponseResolver<GrowthAnalysisDTO[]>),

   http.get(`${BASE_URL}/profitability/:secucode`, (async ({ request, params }) => {
    const { secucode } = params;
    return HttpResponse.json<APIResponse<ProfitabilityAnalysisDTO>>({
      code: 200,
      message: '成功',
      data: profitAnalysisProfitability,
      timestamp: new Date().getTime()
    });
   }) as APIResponseResolver<ProfitabilityAnalysisDTO>),

]