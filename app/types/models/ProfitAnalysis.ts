export interface ProfitAnalysis {
  secucode: string;
  reportDate: string;
  reportType: string;
  operateIncome: number;
  operateIncomeYoy: number|null;
  netprofit: number;
  netprofitYoy: number|null;
  grossMargin: number;
  netMargin: number;
  basicEps: number|null;
  additionalProperties?: Record<string, any>;
}

export interface GrowthAnalysisDTO {
  secucode: string;
  year: number;
  revenueGrowth: number;
  profitGrowth: number;
  marginTrend: number;
}

export interface ProfitabilityAnalysisDTO {
  secucode: string;
  reportDate: string;
  profitabilityScore: number;
  grossMargin: number;
  netMargin: number;
  operateMargin?: number;
  expenseRatios: Record<string, number>;
  growthIndicators: Record<string, number>;
}

// export interface ProfitAnalysis {

// }

// export interface ProfitAnalysis {

// }
