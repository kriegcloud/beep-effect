import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { BusinessAudienceMixin } from '../lib/BusinessAudience.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const BusinessAudienceBundle = [
  AudienceMixin as Mixin,
  BusinessAudienceMixin as Mixin,
  QuantitativeValueMixin as Mixin];
