import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { QuoteActionMixin } from '../lib/QuoteAction.js';
import { TradeActionMixin } from '../lib/TradeAction.js';

export const QuoteActionBundle = [
  QuoteActionMixin as Mixin,
  TradeActionMixin as Mixin];
