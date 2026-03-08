import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContentTypeMixin } from '../lib/ContentType.js';
import { DocumentaryFormTypeMixin } from '../lib/DocumentaryFormType.js';
import { LanguageMixin } from '../lib/Language.js';
import { LegalStatusMixin } from '../lib/LegalStatus.js';
import { RecordMixin } from '../lib/Record.js';
import { RecordPartMixin } from '../lib/RecordPart.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RecordStateMixin } from '../lib/RecordState.js';

export const RecordPartBundle = [
  ContentTypeMixin as Mixin,
  DocumentaryFormTypeMixin as Mixin,
  LanguageMixin as Mixin,
  LegalStatusMixin as Mixin,
  RecordMixin as Mixin,
  RecordPartMixin as Mixin,
  RecordResourceMixin as Mixin,
  RecordStateMixin as Mixin];
