import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalOrganizationMixin } from '../lib/MedicalOrganization.js';
import { PharmacyMixin } from '../lib/Pharmacy.js';

export const PharmacyBundle = [
  MedicalOrganizationMixin as Mixin,
  PharmacyMixin as Mixin];
