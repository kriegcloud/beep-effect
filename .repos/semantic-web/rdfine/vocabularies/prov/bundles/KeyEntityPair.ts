import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EntityMixin } from '../lib/Entity.js';
import { KeyEntityPairMixin } from '../lib/KeyEntityPair.js';

export const KeyEntityPairBundle = [
  EntityMixin as Mixin,
  KeyEntityPairMixin as Mixin];
