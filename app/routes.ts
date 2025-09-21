import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // index("routes/home.tsx")
  layout("layouts/UserLayout/index.tsx", [
    index("routes/home.tsx"),
    
    route("/stock/hourly", "views/stock/MinuteAnalysis/index.tsx"),
    route("/stock/daily", "views/stock/DailyAnalysis/index.tsx"),
    route("/stock/monthly", "views/stock/MonthlyAnalysis/index.tsx"),
    
    route("/fundamental/balance-sheet", "views/fundamental/BalanceSheet/index.tsx"),
    route("/fundamental/income-statement", "views/fundamental/ProfitComparison/index.tsx"),
    route("/fundamental/cash-flow", "views/fundamental/CashFlow/index.tsx"),
    route("/fundamental/company/overview", "views/fundamental/Company/index.tsx"),
    
    route("/macro-economic/indicators/gdp", "views/macro-economic/GDPAnaysis.tsx"),
    route("/macro-economic/indicators/cpi", "views/macro-economic/CPIAnaysis.tsx"),
    route("/macro-economic/indicators/ppi", "views/macro-economic/PPIAnaysis.tsx"),
    route("/macro-economic/indicators/pmi", "views/macro-economic/PMIAnaysis.tsx"),
    route("/macro-economic/indicators/money-supply", "views/macro-economic/MoneySupplyAnaysis.tsx"),
    route("*?", "routes/404.tsx"),
  ]),
] satisfies RouteConfig;
