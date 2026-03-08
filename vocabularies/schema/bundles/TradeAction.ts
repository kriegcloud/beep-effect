import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';
import { TradeActionMixin } from '../lib/TradeAction.js';

export const TradeActionBundle = [
  ActionMixin as Mixin,
  PriceSpecificationMixin as Mixin,
  TradeActionMixin as Mixin];
