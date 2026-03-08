import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EngineSpecificationMixin } from '../lib/EngineSpecification.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const EngineSpecificationBundle = [
  EngineSpecificationMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  StructuredValueMixin as Mixin];
