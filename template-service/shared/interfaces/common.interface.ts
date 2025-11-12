import { PaginationMeta } from '../../src/dto/pagination-meta.dto';

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string | any;
    meta?: PaginationMeta;
}