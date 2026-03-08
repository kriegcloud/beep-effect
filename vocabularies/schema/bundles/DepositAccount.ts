import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BankAccountMixin } from '../lib/BankAccount.js';
import { DepositAccountMixin } from '../lib/DepositAccount.js';
import { InvestmentOrDepositMixin } from '../lib/InvestmentOrDeposit.js';

export const DepositAccountBundle = [
  BankAccountMixin as Mixin,
  DepositAccountMixin as Mixin,
  InvestmentOrDepositMixin as Mixin];
