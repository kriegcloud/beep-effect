import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EducationalOrganizationMixin } from '../lib/EducationalOrganization.js';
import { ElementarySchoolMixin } from '../lib/ElementarySchool.js';

export const ElementarySchoolBundle = [
  EducationalOrganizationMixin as Mixin,
  ElementarySchoolMixin as Mixin];
