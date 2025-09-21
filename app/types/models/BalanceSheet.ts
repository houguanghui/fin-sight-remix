export interface BalanceSheet {
    id: number;
    secucode: string;
    securityNameAbbr: string;
    reportDate: string;
    reportType: string;
    currency: string;
    
    // 核心资产项目
    monetaryfunds: number;
    noteRece: number|null;
    accountsRece: number|null;
    prepayment: number|null;
    inventory: number|null;
    fixedAsset: number|null;
    cip: number|null;
    intangibleAsset: number|null;
    deferTaxAsset: number|null;
    otherCurrentAsset: number|null;
    longEquityInvest: number|null;
    tradeFinasset: number|null;
    
    // 核心负债项目
    noteAccountsPayable: number|null;
    accountsPayable: number|null;
    contractLiab: number|null;
    taxPayable: number|null;
    leaseLiab: number|null;
    deferTaxLiab: number|null;
    totalOtherPayable: number;
    shortLoan: number|null;
    longLoan: number|null;
    bondPayable: number|null;
    
    // 核心权益项目
    shareCapital: number;
    capitalReserve: number;
    surplusReserve: number;
    unassignRprofit: number;
    minorityEquity: number;
    
    // 关键汇总指标
    totalAssets: number|null;
    totalCurrentAssets: number|null;
    totalNoncurrentAssets: number|null;
    totalLiabilities: number|null;
    totalCurrentLiab: number|null;
    totalNoncurrentLiab: number|null;
    totalEquity: number|null;
    totalParentEquity: number|null;
    
    // 关键同比增长指标
    totalAssetsYoy: number;
    totalEquityYoy: number;
    totalLiabilitiesYoy: number;
    inventoryYoy: number;
    monetaryfundsYoy: number;
    
    // 审计信息
    opinionType: string|null;
    
    // 时间戳
    createdAt: string;
    updatedAt: string;
  }