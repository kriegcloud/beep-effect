import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OperationMixin } from '../lib/Operation.js';
import { ResourceMixin } from '../lib/Resource.js';
import { TemplatedLinkMixin } from '../lib/TemplatedLink.js';

export const TemplatedLinkBundle = [
  OperationMixin as Mixin,
  ResourceMixin as Mixin,
  TemplatedLinkMixin as Mixin];
