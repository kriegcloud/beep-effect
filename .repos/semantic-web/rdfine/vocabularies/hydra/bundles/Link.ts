import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LinkMixin } from '../lib/Link.js';
import { OperationMixin } from '../lib/Operation.js';
import { ResourceMixin } from '../lib/Resource.js';

export const LinkBundle = [
  LinkMixin as Mixin,
  OperationMixin as Mixin,
  ResourceMixin as Mixin];
