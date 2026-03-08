import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { MedicalAudienceMixin } from '../lib/MedicalAudience.js';
import { PeopleAudienceMixin } from '../lib/PeopleAudience.js';

export const MedicalAudienceBundle = [
  AudienceMixin as Mixin,
  MedicalAudienceMixin as Mixin,
  PeopleAudienceMixin as Mixin];
