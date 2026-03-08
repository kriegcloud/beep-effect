import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AccommodationMixin } from '../lib/Accommodation.js';
import { ApartmentMixin } from '../lib/Apartment.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const ApartmentBundle = [
  AccommodationMixin as Mixin,
  ApartmentMixin as Mixin,
  QuantitativeValueMixin as Mixin];
