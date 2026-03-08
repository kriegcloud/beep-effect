import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RecordMixin } from '../lib/Record.js';
import { RecordPartMixin } from '../lib/RecordPart.js';
import { RecordSetMixin } from '../lib/RecordSet.js';
import { RecordStateMixin } from '../lib/RecordState.js';
import { TypeMixin } from '../lib/Type.js';

export const RecordStateBundle = [
  RecordMixin as Mixin,
  RecordPartMixin as Mixin,
  RecordSetMixin as Mixin,
  RecordStateMixin as Mixin,
  TypeMixin as Mixin];
