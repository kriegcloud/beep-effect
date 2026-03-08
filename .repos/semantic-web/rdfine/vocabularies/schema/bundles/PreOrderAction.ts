import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PreOrderActionMixin } from '../lib/PreOrderAction.js';
import { TradeActionMixin } from '../lib/TradeAction.js';

export const PreOrderActionBundle = [
  PreOrderActionMixin as Mixin,
  TradeActionMixin as Mixin];
