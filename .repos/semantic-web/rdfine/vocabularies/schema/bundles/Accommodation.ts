import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AccommodationMixin } from '../lib/Accommodation.js';
import { DurationMixin } from '../lib/Duration.js';
import { FloorPlanMixin } from '../lib/FloorPlan.js';
import { LocationFeatureSpecificationMixin } from '../lib/LocationFeatureSpecification.js';
import { PlaceMixin } from '../lib/Place.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const AccommodationBundle = [
  AccommodationMixin as Mixin,
  DurationMixin as Mixin,
  FloorPlanMixin as Mixin,
  LocationFeatureSpecificationMixin as Mixin,
  PlaceMixin as Mixin,
  QuantitativeValueMixin as Mixin];
