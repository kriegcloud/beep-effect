import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EducationalOrganizationMixin } from '../lib/EducationalOrganization.js';
import { PreschoolMixin } from '../lib/Preschool.js';

export const PreschoolBundle = [
  EducationalOrganizationMixin as Mixin,
  PreschoolMixin as Mixin];
