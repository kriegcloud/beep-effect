import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { ReadActionMixin } from '../lib/ReadAction.js';

export const ReadActionBundle = [
  ConsumeActionMixin as Mixin,
  ReadActionMixin as Mixin];
