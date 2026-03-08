import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrderActionMixin } from '../lib/OrderAction.js';
import { TradeActionMixin } from '../lib/TradeAction.js';

export const OrderActionBundle = [
  OrderActionMixin as Mixin,
  TradeActionMixin as Mixin];
