import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { AnatomicalSystemMixin } from '../lib/AnatomicalSystem.js';
import { DDxElementMixin } from '../lib/DDxElement.js';
import { DrugMixin } from '../lib/Drug.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { MedicalConditionStageMixin } from '../lib/MedicalConditionStage.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalRiskFactorMixin } from '../lib/MedicalRiskFactor.js';
import { MedicalSignOrSymptomMixin } from '../lib/MedicalSignOrSymptom.js';
import { MedicalTestMixin } from '../lib/MedicalTest.js';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';
import { SuperficialAnatomyMixin } from '../lib/SuperficialAnatomy.js';

export const MedicalConditionBundle = [
  AnatomicalStructureMixin as Mixin,
  AnatomicalSystemMixin as Mixin,
  DDxElementMixin as Mixin,
  DrugMixin as Mixin,
  MedicalConditionMixin as Mixin,
  MedicalConditionStageMixin as Mixin,
  MedicalEntityMixin as Mixin,
  MedicalRiskFactorMixin as Mixin,
  MedicalSignOrSymptomMixin as Mixin,
  MedicalTestMixin as Mixin,
  MedicalTherapyMixin as Mixin,
  SuperficialAnatomyMixin as Mixin];
