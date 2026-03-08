import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { SaleEventMixin } from '../lib/SaleEvent.js';

export const SaleEventBundle = [
  EventMixin as Mixin,
  SaleEventMixin as Mixin];
