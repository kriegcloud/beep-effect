import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocationFeatureSpecificationMixin } from '../lib/LocationFeatureSpecification.js';
import { OpeningHoursSpecificationMixin } from '../lib/OpeningHoursSpecification.js';
import { PropertyValueMixin } from '../lib/PropertyValue.js';

export const LocationFeatureSpecificationBundle = [
  LocationFeatureSpecificationMixin as Mixin,
  OpeningHoursSpecificationMixin as Mixin,
  PropertyValueMixin as Mixin];
