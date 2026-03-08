import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AccommodationMixin } from '../lib/Accommodation.js';
import { HouseMixin } from '../lib/House.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const HouseBundle = [
  AccommodationMixin as Mixin,
  HouseMixin as Mixin,
  QuantitativeValueMixin as Mixin];
