import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PostalCodeRangeSpecificationMixin } from '../lib/PostalCodeRangeSpecification.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const PostalCodeRangeSpecificationBundle = [
  PostalCodeRangeSpecificationMixin as Mixin,
  StructuredValueMixin as Mixin];
