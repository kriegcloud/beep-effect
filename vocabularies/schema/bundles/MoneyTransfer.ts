import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BankOrCreditUnionMixin } from '../lib/BankOrCreditUnion.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { MoneyTransferMixin } from '../lib/MoneyTransfer.js';
import { TransferActionMixin } from '../lib/TransferAction.js';

export const MoneyTransferBundle = [
  BankOrCreditUnionMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  MoneyTransferMixin as Mixin,
  TransferActionMixin as Mixin];
