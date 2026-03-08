import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DefinedTermSetMixin } from '../lib/DefinedTermSet.js';

export const DefinedTermSetBundle = [
  CreativeWorkMixin as Mixin,
  DefinedTermSetMixin as Mixin];
