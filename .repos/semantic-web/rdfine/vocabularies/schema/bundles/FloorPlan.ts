import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AccommodationMixin } from '../lib/Accommodation.js';
import { FloorPlanMixin } from '../lib/FloorPlan.js';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { LocationFeatureSpecificationMixin } from '../lib/LocationFeatureSpecification.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const FloorPlanBundle = [
  AccommodationMixin as Mixin,
  FloorPlanMixin as Mixin,
  ImageObjectMixin as Mixin,
  IntangibleMixin as Mixin,
  LocationFeatureSpecificationMixin as Mixin,
  QuantitativeValueMixin as Mixin];
