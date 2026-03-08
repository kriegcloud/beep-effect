import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { MedicalCodeMixin } from '../lib/MedicalCode.js';
import { MedicalIntangibleMixin } from '../lib/MedicalIntangible.js';

export const MedicalCodeBundle = [
  CategoryCodeMixin as Mixin,
  MedicalCodeMixin as Mixin,
  MedicalIntangibleMixin as Mixin];
