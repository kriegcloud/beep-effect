import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { AnatomicalSystemMixin } from '../lib/AnatomicalSystem.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';

export const AnatomicalSystemBundle = [
  AnatomicalStructureMixin as Mixin,
  AnatomicalSystemMixin as Mixin,
  MedicalConditionMixin as Mixin,
  MedicalEntityMixin as Mixin,
  MedicalTherapyMixin as Mixin];
