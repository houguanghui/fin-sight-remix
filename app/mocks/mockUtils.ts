import type { APIResponse, Pageable, PageDTO, Sort } from "@/types";
import type { DefaultBodyType, PathParams, ResponseResolver } from "msw";

// 明确指定响应解析器的类型
export type APIResponseResolver<T> = ResponseResolver<
  { 
    request: Request; 
    params: PathParams 
  }, 
  DefaultBodyType, 
  APIResponse<T>
>;

export interface PageResponse<T> extends PageDTO<T> {}

export const paginateData = <T>(
  data: T[],
  pageNumber: number,
  pageSize: number,
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
): PageResponse<T> => {
  // 深拷贝数据以避免修改原数据
  let processedData = [...data];
  
  // 排序处理
  if (sortField && sortDirection) {
    processedData.sort((a, b) => {
      const aValue = a[sortField as keyof T];
      const bValue = b[sortField as keyof T];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });
  }

  const totalElements = processedData.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  
  // 计算分页
  const startIndex = pageNumber * pageSize;
  const endIndex = startIndex + pageSize;
  const content = processedData.slice(startIndex, endIndex);

  const sort: Sort = {
    sorted: !!sortField,
    empty: false,
    unsorted: !sortField
  };

  const pageable: Pageable = {
    pageNumber,
    pageSize,
    sort,
    offset: startIndex,
    paged: true,
    unpaged: false
  };

  return {
    content,
    pageable,
    last: pageNumber >= totalPages - 1,
    totalPages,
    totalElements,
    size: pageSize,
    number: pageNumber,
    first: pageNumber === 0,
    numberOfElements: content.length,
    sort,
    empty: content.length === 0
  };
};