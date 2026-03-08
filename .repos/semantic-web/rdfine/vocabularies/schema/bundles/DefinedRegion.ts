import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CountryMixin } from '../lib/Country.js';
import { DefinedRegionMixin } from '../lib/DefinedRegion.js';
import { PostalCodeRangeSpecificationMixin } from '../lib/PostalCodeRangeSpecification.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const DefinedRegionBundle = [
  CountryMixin as Mixin,
  DefinedRegionMixin as Mixin,
  PostalCodeRangeSpecificationMixin as Mixin,
  StructuredValueMixin as Mixin];
