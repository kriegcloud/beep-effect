import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EducationalOrganizationMixin } from '../lib/EducationalOrganization.js';
import { MiddleSchoolMixin } from '../lib/MiddleSchool.js';

export const MiddleSchoolBundle = [
  EducationalOrganizationMixin as Mixin,
  MiddleSchoolMixin as Mixin];
