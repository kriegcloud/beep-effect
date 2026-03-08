import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const StructuredValueBundle = [
  IntangibleMixin as Mixin,
  StructuredValueMixin as Mixin];
