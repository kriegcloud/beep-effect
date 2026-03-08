import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AlignmentObjectMixin } from '../lib/AlignmentObject.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { LearningResourceMixin } from '../lib/LearningResource.js';

export const LearningResourceBundle = [
  AlignmentObjectMixin as Mixin,
  CreativeWorkMixin as Mixin,
  LearningResourceMixin as Mixin];
