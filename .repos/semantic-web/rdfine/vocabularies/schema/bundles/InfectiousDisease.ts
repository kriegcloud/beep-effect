import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InfectiousDiseaseMixin } from '../lib/InfectiousDisease.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';

export const InfectiousDiseaseBundle = [
  InfectiousDiseaseMixin as Mixin,
  MedicalConditionMixin as Mixin];
