import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { ResearcherMixin } from '../lib/Researcher.js';

export const ResearcherBundle = [
  AudienceMixin as Mixin,
  ResearcherMixin as Mixin];
