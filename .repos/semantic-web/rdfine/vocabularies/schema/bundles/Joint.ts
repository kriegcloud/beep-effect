import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { JointMixin } from '../lib/Joint.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';

export const JointBundle = [
  AnatomicalStructureMixin as Mixin,
  JointMixin as Mixin,
  MedicalEntityMixin as Mixin];
