import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalConditionStageMixin } from '../lib/MedicalConditionStage.js';
import { MedicalIntangibleMixin } from '../lib/MedicalIntangible.js';

export const MedicalConditionStageBundle = [
  MedicalConditionStageMixin as Mixin,
  MedicalIntangibleMixin as Mixin];
