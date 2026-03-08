import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { OccupationalExperienceRequirementsMixin } from '../lib/OccupationalExperienceRequirements.js';

export const OccupationalExperienceRequirementsBundle = [
  IntangibleMixin as Mixin,
  OccupationalExperienceRequirementsMixin as Mixin];
