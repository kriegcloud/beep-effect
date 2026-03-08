import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DrugMixin } from '../lib/Drug.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { MedicalDeviceMixin } from '../lib/MedicalDevice.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalSignMixin } from '../lib/MedicalSign.js';
import { MedicalTestMixin } from '../lib/MedicalTest.js';

export const MedicalTestBundle = [
  DrugMixin as Mixin,
  MedicalConditionMixin as Mixin,
  MedicalDeviceMixin as Mixin,
  MedicalEntityMixin as Mixin,
  MedicalSignMixin as Mixin,
  MedicalTestMixin as Mixin];
