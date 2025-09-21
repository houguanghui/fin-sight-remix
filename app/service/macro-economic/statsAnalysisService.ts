import type { Returndata } from '@/types/models/Returndata';
import { http as request } from '@/utils/request';

const BASE_URL = '/api/statistics';

export const StatsAnalysisAPI = {

  // 获取GDP数据
  getAnalysisData: async (
    zb: string,
    params?: { startTime?: string; endTime?: string },
  ): Promise<Returndata> => {
    
    const response = await request.get<Returndata>(`${BASE_URL}/${zb}`,params);
    return response;
  },
}