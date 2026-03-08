import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalOrganizationMixin } from '../lib/MedicalOrganization.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const MedicalOrganizationBundle = [
  MedicalOrganizationMixin as Mixin,
  OrganizationMixin as Mixin];
