import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClassMixin } from '../lib/Class.js';
import { RestrictionMixin } from '../lib/Restriction.js';

export const RestrictionBundle = [
  ClassMixin as Mixin,
  RestrictionMixin as Mixin];
