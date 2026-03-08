import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BlockMixin } from '../lib/Block.js';
import { IgnoreMixin } from '../lib/Ignore.js';

export const BlockBundle = [
  BlockMixin as Mixin,
  IgnoreMixin as Mixin];
