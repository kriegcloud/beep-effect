import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InvestmentFundMixin } from '../lib/InvestmentFund.js';
import { InvestmentOrDepositMixin } from '../lib/InvestmentOrDeposit.js';

export const InvestmentFundBundle = [
  InvestmentFundMixin as Mixin,
  InvestmentOrDepositMixin as Mixin];
