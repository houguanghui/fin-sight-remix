export interface APIResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}