import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RecordSetMixin } from '../lib/RecordSet.js';
import { RecordSetTypeMixin } from '../lib/RecordSetType.js';
import { TypeMixin } from '../lib/Type.js';

export const RecordSetTypeBundle = [
  RecordSetMixin as Mixin,
  RecordSetTypeMixin as Mixin,
  TypeMixin as Mixin];
