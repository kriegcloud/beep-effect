import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollegeOrUniversityMixin } from '../lib/CollegeOrUniversity.js';
import { EducationalOrganizationMixin } from '../lib/EducationalOrganization.js';

export const CollegeOrUniversityBundle = [
  CollegeOrUniversityMixin as Mixin,
  EducationalOrganizationMixin as Mixin];
