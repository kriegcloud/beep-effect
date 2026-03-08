import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { BoneMixin } from '../lib/Bone.js';

export const BoneBundle = [
  AnatomicalStructureMixin as Mixin,
  BoneMixin as Mixin];
