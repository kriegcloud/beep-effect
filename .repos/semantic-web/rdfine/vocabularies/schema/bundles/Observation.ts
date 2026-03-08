import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { ObservationMixin } from '../lib/Observation.js';
import { PropertyMixin } from '../lib/Property.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { StatisticalPopulationMixin } from '../lib/StatisticalPopulation.js';

export const ObservationBundle = [
  IntangibleMixin as Mixin,
  ObservationMixin as Mixin,
  PropertyMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  StatisticalPopulationMixin as Mixin];
