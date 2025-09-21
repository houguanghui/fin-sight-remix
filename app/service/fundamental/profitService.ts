import type { GrowthAnalysisDTO, ProfitabilityAnalysisDTO, ProfitAnalysis } from '@/types';
import { http } from '@/utils/request';

export const ProfitService = {
  // 获取历史利润数据
  async getProfitHistory(secucode: string): Promise<ProfitAnalysis[]> {
    return http.get<ProfitAnalysis[]>(
      `/api/profit-analysis/history/${encodeURIComponent(secucode)}`
    );
  },

  // 增长趋势分析
  async analyzeGrowthTrend(
    secucode: string,
    years: number = 5
  ): Promise<GrowthAnalysisDTO[]> {
    return http.get<GrowthAnalysisDTO[]>(
      `/api/profit-analysis/growth/${encodeURIComponent(secucode)}`,
      { years }
    );
  },

  // 盈利能力分析
  async analyzeProfitability(secucode: string): Promise<ProfitabilityAnalysisDTO> {
    return http.get<ProfitabilityAnalysisDTO>(
      `/api/profit-analysis/profitability/${encodeURIComponent(secucode)}`
    );
  },
};