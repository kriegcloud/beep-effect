import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AlignmentObjectMixin } from '../lib/AlignmentObject.js';
import { IntangibleMixin } from '../lib/Intangible.js';

export const AlignmentObjectBundle = [
  AlignmentObjectMixin as Mixin,
  IntangibleMixin as Mixin];
