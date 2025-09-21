import type { CashFlow, CashFlowCompare, CashFlowHealth, CashFlowQuality, CashFlowRatio, CashFlowStructure, CashFlowTrend } from '@/types';
import { http as request } from '@/utils/request';

const BASE_URL = '/api/cash-flow';

export const CashFlowAPI = {
  // 获取现金流量数据
  getCashFlowData: async (
    secucode: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<CashFlow[]> => {
    
    const response = await request.get<CashFlow[]>(`${BASE_URL}/${secucode}`,params);
    return response;
  },

  // 获取现金流趋势
  getCashFlowTrend: async (
    secucode: string,
    years: number = 5,
  ): Promise<CashFlowTrend> => {
    const response = await request.get<CashFlowTrend>(`${BASE_URL}/${secucode}/trend`,{years});
    return response;
  },

  // 对比分析
  compareCashFlow: async (
    requestData: CashFlowCompare,
  ): Promise<any> => {
    const response = await request.post<any>(`${BASE_URL}/compare`,requestData);
    return response;
  },

  // 获取现金流健康状况
  getCashFlowHealth: async (
    secucode: string,
    reportDate: string,
  ): Promise<CashFlowHealth> => {
    const response = await request.get<CashFlowHealth>(`${BASE_URL}/${secucode}/health`,{reportDate});
    return response;
  },

  // 获取现金流质量分析
  getCashFlowQuality: async (
    secucode: string,
    reportDate: string,
  ): Promise<CashFlowQuality> => {
    const response = await request.get<CashFlowQuality>(`${BASE_URL}/${secucode}/quality`,{reportDate});
    return response;
  },
};