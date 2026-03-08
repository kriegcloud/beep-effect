import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CompoundPriceSpecificationMixin } from '../lib/CompoundPriceSpecification.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';
import { UnitPriceSpecificationMixin } from '../lib/UnitPriceSpecification.js';

export const CompoundPriceSpecificationBundle = [
  CompoundPriceSpecificationMixin as Mixin,
  PriceSpecificationMixin as Mixin,
  UnitPriceSpecificationMixin as Mixin];
