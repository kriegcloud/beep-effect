import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EducationalOrganizationMixin } from '../lib/EducationalOrganization.js';
import { HighSchoolMixin } from '../lib/HighSchool.js';

export const HighSchoolBundle = [
  EducationalOrganizationMixin as Mixin,
  HighSchoolMixin as Mixin];
