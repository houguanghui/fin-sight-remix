export interface StockDaily {
  date: string;
  code: string;
  open: number;
  high: number;
  low: number;
  close: number;
  preclose: number;
  volume: number;
  amount: number;
  adjustflag: string;
  turn: number;
  tradestatus: string;
  pctChg: number|null;
  isST: boolean;
}