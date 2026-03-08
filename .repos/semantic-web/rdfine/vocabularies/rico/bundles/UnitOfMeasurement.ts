import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConceptMixin } from '../lib/Concept.js';
import { ExtentMixin } from '../lib/Extent.js';
import { UnitOfMeasurementMixin } from '../lib/UnitOfMeasurement.js';

export const UnitOfMeasurementBundle = [
  ConceptMixin as Mixin,
  ExtentMixin as Mixin,
  UnitOfMeasurementMixin as Mixin];
