/* eslint-disable prettier/prettier */
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  populate?: string | string[];
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
