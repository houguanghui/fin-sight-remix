import type { PageDTO } from '@/types';
import type { CompanyInfo } from '@/types/models/CompanyInfo';
import { http as request } from '@/utils/request';

const BASE_URL = '/api/sec-info';

export const CompanyInfoAPI = {
  getCompanyInfoList: async (
      params: any
    ): Promise<PageDTO<CompanyInfo>> => {
      const response = await request.get<PageDTO<CompanyInfo>>(`${BASE_URL}`,params);
      return response;
    },
  
  getCompanyInfoDetail: async (
      id: number
    ): Promise<CompanyInfo> => {
      const response = await request.get<CompanyInfo>(`${BASE_URL}/${id}`);
      return response;
    },

}