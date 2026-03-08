import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PropertyValueMixin } from '../lib/PropertyValue.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const QuantitativeValueBundle = [
  PropertyValueMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  StructuredValueMixin as Mixin];
