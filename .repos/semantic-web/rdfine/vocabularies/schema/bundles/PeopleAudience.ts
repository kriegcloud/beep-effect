import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { PeopleAudienceMixin } from '../lib/PeopleAudience.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const PeopleAudienceBundle = [
  AudienceMixin as Mixin,
  MedicalConditionMixin as Mixin,
  PeopleAudienceMixin as Mixin,
  QuantitativeValueMixin as Mixin];
