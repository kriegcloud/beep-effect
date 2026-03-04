export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends Entity {
  email: string;
  name: string;
  role: UserRole;
}

export interface Account extends Entity {
  userId: string;
  balance: number;
  currency: Currency;
  holdings: Holding[];
}

export interface Holding {
  symbol: string;
  quantity: number;
  costBasis: number;
}

export interface Transaction extends Entity {
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
}

export type UserRole = "admin" | "advisor" | "client";
export type Currency = "USD" | "EUR" | "GBP";
export type TransactionType = "deposit" | "withdrawal" | "trade" | "fee";

export enum AccountStatus {
  Active = "active",
  Suspended = "suspended",
  Closed = "closed",
}
