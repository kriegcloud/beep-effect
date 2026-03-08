import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { DrugLegalStatusMixin } from '../lib/DrugLegalStatus.js';
import { MedicalIntangibleMixin } from '../lib/MedicalIntangible.js';

export const DrugLegalStatusBundle = [
  AdministrativeAreaMixin as Mixin,
  DrugLegalStatusMixin as Mixin,
  MedicalIntangibleMixin as Mixin];
