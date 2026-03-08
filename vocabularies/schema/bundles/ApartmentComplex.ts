import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ApartmentComplexMixin } from '../lib/ApartmentComplex.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { ResidenceMixin } from '../lib/Residence.js';

export const ApartmentComplexBundle = [
  ApartmentComplexMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  ResidenceMixin as Mixin];
