import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClassMixin } from '../lib/Class.js';
import { DatatypeMixin } from '../lib/Datatype.js';

export const DatatypeBundle = [
  ClassMixin as Mixin,
  DatatypeMixin as Mixin];
