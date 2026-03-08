import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EducationalOrganizationMixin } from '../lib/EducationalOrganization.js';
import { SchoolMixin } from '../lib/School.js';

export const SchoolBundle = [
  EducationalOrganizationMixin as Mixin,
  SchoolMixin as Mixin];
