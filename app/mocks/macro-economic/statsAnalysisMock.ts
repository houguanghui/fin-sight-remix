import { delay, http, HttpResponse } from 'msw';
import type { APIResponseResolver } from '../mockUtils';
import type { APIResponse, Returndata } from '@/types';
import cpi_A01030G_month from './cpi_A01030G_month.json'
import gdp_A0101_quarter from './gdp_A0101_quarter.json'
import gdp_A0102_quarter from './gdp_A0102_quarter.json'
import gdp_A0201_year from './gdp_A0201_year.json'
import hbgy_A0D01_month from './hbgy_A0D01_month.json'
import pmi_A0B01_month from './pmi_A0B01_month.json'
import ppi_A0901_year from './ppi_A0901_year.json'
import ppi_A010807_month from './ppi_A010807_month.json'

const BASE_URL = `${import.meta.env.VITE_MOCK_URL}/api/statistics`

export const statsAnalysisMock = [
  http.get(`${BASE_URL}/:salesMetric`, (async ({ request, params }) => {
    await delay(500);
    const url = new URL(request.url);
    const { salesMetric } = params;
    // 查询参数
    const startTime = url.searchParams.get('startTime');
    const endTime = url.searchParams.get('endTime');

    const result = 
      salesMetric == 'cpi_A01030G_month'?cpi_A01030G_month
      :salesMetric == 'gdp_A0101_quarter'?gdp_A0101_quarter
      :salesMetric == 'gdp_A0102_quarter'?gdp_A0102_quarter
      :salesMetric == 'gdp_A0201_year'?gdp_A0201_year
      :salesMetric == 'hbgy_A0D01_month'?hbgy_A0D01_month
      :salesMetric == 'pmi_A0B01_month'?pmi_A0B01_month
      :salesMetric == 'ppi_A0901_year'?ppi_A0901_year
      :salesMetric == 'ppi_A010807_month'?ppi_A010807_month:null

    return HttpResponse.json<APIResponse<Returndata|null>>({
      code: 200,
      message: '成功',
      data: result,
      timestamp: new Date().getTime()
    });
  })as APIResponseResolver<Returndata>),
]