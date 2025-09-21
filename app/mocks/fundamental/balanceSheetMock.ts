import { delay, http, HttpResponse } from 'msw';
import balanceSheetData from './balanceSheetMock.json';
import type { APIResponse, BalanceSheet } from '@/types';
import { paginateData, type APIResponseResolver, type PageResponse } from '../mockUtils';

const BASE_URL = `${import.meta.env.VITE_MOCK_URL}/api/balance-sheet`

export const balanceSheetMock = [
  http.get(`${BASE_URL}/secucode/:secucode/date-range`, (async ({ request, params }) => {
    await delay(500);
    
    const url = new URL(request.url);
    const { secucode } = params;
    
    // 分页参数
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    const sortField = url.searchParams.get('sort');
    const sortDirection = url.searchParams.get('direction') as 'asc' | 'desc' || 'desc';
    
    // 查询参数
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!secucode) {
      return HttpResponse.json<APIResponse<null>>({
        code: 400,
        message: '证券代码不能为空',
        data: null,
        timestamp: new Date().getTime()
      }, { status: 400 });
    }

    // 过滤数据
    let filteredData = balanceSheetData.filter(item => item.secucode === secucode);

    // 日期范围过滤
    if (startDate && endDate) {
      filteredData = filteredData.filter(item => {
        const reportDate = new Date(item.reportDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return reportDate >= start && reportDate <= end;
      });
    }

    // 按报告日期排序（最新的在前）
    filteredData.sort((a, b) => 
      new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
    );

    if (filteredData.length === 0) {
      return HttpResponse.json<APIResponse<PageResponse<BalanceSheet>>>({
        code: 404,
        message: `未找到证券代码 ${secucode} 的资产负债表数据`,
        data: {
          content: [],
          pageable: {
            pageNumber: page,
            pageSize: size,
            sort: { sorted: false, empty: true, unsorted: true },
            offset: page * size,
            paged: true,
            unpaged: false
          },
          last: true,
          totalPages: 0,
          totalElements: 0,
          size: size,
          number: page,
          first: true,
          numberOfElements: 0,
          sort: { sorted: false, empty: true, unsorted: true },
          empty: true
        },
        timestamp: new Date().getTime()
      }, { status: 404 });
    }

    // 应用分页
    const pagedData = paginateData<BalanceSheet>(
      filteredData,
      page,
      size,
      sortField || 'reportDate',
      sortDirection
    );

    return HttpResponse.json<APIResponse<PageResponse<BalanceSheet>>>({
      code: 200,
      message: '成功',
      data: pagedData,
      timestamp: new Date().getTime()
    });
  })as APIResponseResolver<PageResponse<BalanceSheet>>),
]