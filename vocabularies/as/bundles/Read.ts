import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { ReadMixin } from '../lib/Read.js';

export const ReadBundle = [
  ActivityMixin as Mixin,
  ReadMixin as Mixin];
