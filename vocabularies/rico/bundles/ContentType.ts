import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContentTypeMixin } from '../lib/ContentType.js';
import { RecordMixin } from '../lib/Record.js';
import { RecordPartMixin } from '../lib/RecordPart.js';
import { RecordSetMixin } from '../lib/RecordSet.js';
import { TypeMixin } from '../lib/Type.js';

export const ContentTypeBundle = [
  ContentTypeMixin as Mixin,
  RecordMixin as Mixin,
  RecordPartMixin as Mixin,
  RecordSetMixin as Mixin,
  TypeMixin as Mixin];
