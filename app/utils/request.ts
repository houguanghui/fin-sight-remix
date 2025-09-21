import { API_CONFIG } from "@/config/api"
import type { APIResponse } from "@/types";

const BASE_URL  = API_CONFIG.BASE_URL

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, data, params } = options;

  // 处理查询参数
  let queryString = '';
  if (params && Object.keys(params).length > 0) {
    queryString = '?' + new URLSearchParams(params).toString();
  }

  const fullUrl = `${BASE_URL}${url}${queryString}`;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // 如果需要携带cookie
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: APIResponse<T> = await response.json();
    
    // 根据新的响应格式调整判断逻辑
    if (result.code !== 200) {
      throw new Error(result.message || '请求失败');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

// 封装常用的请求方法
export const http = {
  get: <T>(url: string, params?: Record<string, any>) => 
    request<T>(url, { method: 'GET', params }),

  post: <T>(url: string, data?: any) => 
    request<T>(url, { method: 'POST', data }),

  put: <T>(url: string, data?: any) => 
    request<T>(url, { method: 'PUT', data }),

  delete: <T>(url: string) => 
    request<T>(url, { method: 'DELETE' }),
};