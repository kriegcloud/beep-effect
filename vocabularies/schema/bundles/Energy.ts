import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EnergyMixin } from '../lib/Energy.js';
import { QuantityMixin } from '../lib/Quantity.js';

export const EnergyBundle = [
  EnergyMixin as Mixin,
  QuantityMixin as Mixin];
