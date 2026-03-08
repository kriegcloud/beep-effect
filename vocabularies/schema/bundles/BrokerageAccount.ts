import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BrokerageAccountMixin } from '../lib/BrokerageAccount.js';
import { InvestmentOrDepositMixin } from '../lib/InvestmentOrDeposit.js';

export const BrokerageAccountBundle = [
  BrokerageAccountMixin as Mixin,
  InvestmentOrDepositMixin as Mixin];
