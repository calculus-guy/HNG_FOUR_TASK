import { ApiProperty } from '@nestjs/swagger';

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export class StandardResponse<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  meta?: PaginationMeta;
}

export function createResponse<T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string,
  meta?: PaginationMeta
): StandardResponse<T> {
  return {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(error && { error }),
    ...(meta && { meta }),
  };
}

export function createPaginatedResponse<T>(
  success: boolean,
  message: string,
  data: T[],
  total: number,
  page: number,
  limit: number
): StandardResponse<T[]> {
  const total_pages = Math.ceil(total / limit);
  
  return {
    success,
    message,
    data,
    meta: {
      total,
      limit,
      page,
      total_pages,
      has_next: page < total_pages,
      has_previous: page > 1,
    },
  };
}
