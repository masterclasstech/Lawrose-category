/* eslint-disable prettier/prettier */
import { PaginationOptions, PaginationResult } from "../interfaces/pagination.interface";


export interface BaseRepository<T> {
  findAll(options?: PaginationOptions): Promise<PaginationResult<T>>;
  findById(id: string): Promise<T | null>;
  findBySlug(slug: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<T | null>;
  count(filter?: any): Promise<number>;
}