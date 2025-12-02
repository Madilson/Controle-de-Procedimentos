export type Role = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this should be hashed
  name: string;
  role: Role;
}

export interface Procedure {
  id: string;
  date: string; // Stored in YYYY-MM-DD format
  region: string;
  state: string;
  hospitalUnit: string;
  procedureName: string;
  qtyPerformed: number;
  qtyBilled: number;
  qtyPaid: number;
  valuePerformed: number;
  valueBilled: number;
  valuePaid: number;
  createdBy?: string; // User who created the record
  lastModifiedBy?: string; // User who last edited the record
  lastModifiedAt?: string;
}