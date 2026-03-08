import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AccommodationMixin } from '../lib/Accommodation.js';
import { BedDetailsMixin } from '../lib/BedDetails.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { SuiteMixin } from '../lib/Suite.js';

export const SuiteBundle = [
  AccommodationMixin as Mixin,
  BedDetailsMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  SuiteMixin as Mixin];
