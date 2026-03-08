import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CountryMixin } from '../lib/Country.js';
import { GeoCoordinatesMixin } from '../lib/GeoCoordinates.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const GeoCoordinatesBundle = [
  CountryMixin as Mixin,
  GeoCoordinatesMixin as Mixin,
  PostalAddressMixin as Mixin,
  StructuredValueMixin as Mixin];
