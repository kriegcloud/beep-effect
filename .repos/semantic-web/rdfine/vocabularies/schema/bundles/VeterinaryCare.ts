import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalOrganizationMixin } from '../lib/MedicalOrganization.js';
import { VeterinaryCareMixin } from '../lib/VeterinaryCare.js';

export const VeterinaryCareBundle = [
  MedicalOrganizationMixin as Mixin,
  VeterinaryCareMixin as Mixin];
