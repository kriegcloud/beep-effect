import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CovidTestingFacilityMixin } from '../lib/CovidTestingFacility.js';
import { MedicalClinicMixin } from '../lib/MedicalClinic.js';

export const CovidTestingFacilityBundle = [
  CovidTestingFacilityMixin as Mixin,
  MedicalClinicMixin as Mixin];
