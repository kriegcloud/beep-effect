import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { AnatomicalSystemMixin } from '../lib/AnatomicalSystem.js';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalTherapyMixin } from '../lib/MedicalTherapy.js';

export const AnatomicalStructureBundle = [
  AnatomicalStructureMixin as Mixin,
  AnatomicalSystemMixin as Mixin,
  ImageObjectMixin as Mixin,
  MedicalConditionMixin as Mixin,
  MedicalEntityMixin as Mixin,
  MedicalTherapyMixin as Mixin];
