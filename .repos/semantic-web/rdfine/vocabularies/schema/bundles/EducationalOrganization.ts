import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { EducationalOrganizationMixin } from '../lib/EducationalOrganization.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const EducationalOrganizationBundle = [
  CivicStructureMixin as Mixin,
  EducationalOrganizationMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
