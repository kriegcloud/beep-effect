import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { LanguageMixin } from '../lib/Language.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { LocationFeatureSpecificationMixin } from '../lib/LocationFeatureSpecification.js';
import { LodgingBusinessMixin } from '../lib/LodgingBusiness.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { RatingMixin } from '../lib/Rating.js';

export const LodgingBusinessBundle = [
  AudienceMixin as Mixin,
  LanguageMixin as Mixin,
  LocalBusinessMixin as Mixin,
  LocationFeatureSpecificationMixin as Mixin,
  LodgingBusinessMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  RatingMixin as Mixin];
