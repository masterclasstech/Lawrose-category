/* eslint-disable prettier/prettier */
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}