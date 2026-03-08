import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { AnatomicalSystemMixin } from '../lib/AnatomicalSystem.js';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { LifestyleModificationMixin } from '../lib/LifestyleModification.js';
import { PhysicalActivityMixin } from '../lib/PhysicalActivity.js';
import { SuperficialAnatomyMixin } from '../lib/SuperficialAnatomy.js';
import { ThingMixin } from '../lib/Thing.js';

export const PhysicalActivityBundle = [
  AnatomicalStructureMixin as Mixin,
  AnatomicalSystemMixin as Mixin,
  CategoryCodeMixin as Mixin,
  LifestyleModificationMixin as Mixin,
  PhysicalActivityMixin as Mixin,
  SuperficialAnatomyMixin as Mixin,
  ThingMixin as Mixin];
