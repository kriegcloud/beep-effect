import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClassMixin } from '../lib/Class.js';
import { ResourceMixin } from '../lib/Resource.js';

export const MemberAssertionBundle = [
  ClassMixin as Mixin,
  ResourceMixin as Mixin];
