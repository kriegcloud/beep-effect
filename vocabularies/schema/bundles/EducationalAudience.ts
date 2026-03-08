import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { EducationalAudienceMixin } from '../lib/EducationalAudience.js';

export const EducationalAudienceBundle = [
  AudienceMixin as Mixin,
  EducationalAudienceMixin as Mixin];
