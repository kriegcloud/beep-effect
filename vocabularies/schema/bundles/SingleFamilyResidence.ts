import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HouseMixin } from '../lib/House.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { SingleFamilyResidenceMixin } from '../lib/SingleFamilyResidence.js';

export const SingleFamilyResidenceBundle = [
  HouseMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  SingleFamilyResidenceMixin as Mixin];
