import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DentistMixin } from '../lib/Dentist.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { MedicalOrganizationMixin } from '../lib/MedicalOrganization.js';

export const DentistBundle = [
  DentistMixin as Mixin,
  LocalBusinessMixin as Mixin,
  MedicalOrganizationMixin as Mixin];
