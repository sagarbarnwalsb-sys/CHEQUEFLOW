export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export enum ChequeStatus {
  BOUNCE = 'BOUNCE',
  CLEAR = 'CLEAR',
  POSTDATED = 'POSTDATED'
}

export interface UserProfile {
  firmName: string;
  email: string;
  createdAt: unknown;
}

export interface Cheque {
  id: string;
  userId: string;
  bankName: string;
  customerName: string;
  amount: number;
  chequeDateBS: string; // YYYY/MM/DD
  receivedDateBS: string; // YYYY/MM/DD
  contactNo: string;
  status: ChequeStatus;
  remarks?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface BankDetail {
  id: string;
  userId: string;
  bankName: string;
  accountNumber?: string;
  branch?: string;
  createdAt: unknown;
}

export interface CustomerDetail {
  id: string;
  userId: string;
  customerName: string;
  contactNo?: string;
  createdAt: unknown;
}
