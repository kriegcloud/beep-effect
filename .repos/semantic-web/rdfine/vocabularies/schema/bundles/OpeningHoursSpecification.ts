import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OpeningHoursSpecificationMixin } from '../lib/OpeningHoursSpecification.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const OpeningHoursSpecificationBundle = [
  OpeningHoursSpecificationMixin as Mixin,
  StructuredValueMixin as Mixin];
