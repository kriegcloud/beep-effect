import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BundleMixin } from '../lib/Bundle.js';
import { EntityMixin } from '../lib/Entity.js';

export const BundleBundle = [
  BundleMixin as Mixin,
  EntityMixin as Mixin];
