export interface CashFlow {
  id: number;
  secucode: string;
  securityNameAbbr: string;
  reportDate: string;
  reportType?: string|null;
  netcashOperate?: number|null;
  netcashInvest?: number|null;
  netcashFinance?: number|null;
  salesServices?: number|null;
  buyServices?: number|null;
  constructLongAsset?: number;
  netprofit?: number|null;
  payInterestCommission?: number|null;
  beginCce?: number|null;
  endCce?: number|null;
  createdAt: string;
  updatedAt: string;
}

export interface CashFlowTrend {
  dates: string[];
  operatingCashFlows: number[];
  investingCashFlows: number[];
  financingCashFlows: number[];
  freeCashFlows: number[];
  growthRates?: number[]|null;
}

export interface CashFlowCompare {
  secucodes: string[];
  reportDate: string;
  metrics?: string[];
}

export interface CashFlowHealth {
  score: number;
  healthLevel: string;
  warnings: string[];
  strengths?: string[]|null;
}

export interface CashFlowQuality {
  operatingVsProfit?: boolean;
  operatingCashFlow?: number;
  netProfit?: number;
  freeCashFlowPositive?: boolean;
  freeCashFlow?: number;
  cashIncomeRatio?: number;
  cashIncomeRatioGood?: boolean;
  reinvestmentRatio?: number;
  reinvestmentRatioGood?: boolean;
  cashFlowAdequacy?: number;
  cashFlowAdequacyGood?: boolean;
}

export interface CashFlowRatio {
  profitCashRatio?: number;
  reinvestmentRatio?: number;
  interestCoverage?: number;
  cashCollectionRatio?: number;
  operatingMargin?: number;
}

export interface CashFlowStructure {
  operatingRatio?: number;
  investingRatio?: number;
  financingRatio?: number;
}