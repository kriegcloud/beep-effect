import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CountryMixin } from '../lib/Country.js';
import { GeoShapeMixin } from '../lib/GeoShape.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const GeoShapeBundle = [
  CountryMixin as Mixin,
  GeoShapeMixin as Mixin,
  PostalAddressMixin as Mixin,
  StructuredValueMixin as Mixin];
