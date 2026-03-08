import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContentTypeMixin } from '../lib/ContentType.js';
import { DateMixin } from '../lib/Date.js';
import { DocumentaryFormTypeMixin } from '../lib/DocumentaryFormType.js';
import { LanguageMixin } from '../lib/Language.js';
import { LegalStatusMixin } from '../lib/LegalStatus.js';
import { RecordMixin } from '../lib/Record.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RecordSetMixin } from '../lib/RecordSet.js';
import { RecordSetTypeMixin } from '../lib/RecordSetType.js';
import { RecordStateMixin } from '../lib/RecordState.js';
import { TypeMixin } from '../lib/Type.js';

export const RecordSetBundle = [
  ContentTypeMixin as Mixin,
  DateMixin as Mixin,
  DocumentaryFormTypeMixin as Mixin,
  LanguageMixin as Mixin,
  LegalStatusMixin as Mixin,
  RecordMixin as Mixin,
  RecordResourceMixin as Mixin,
  RecordSetMixin as Mixin,
  RecordSetTypeMixin as Mixin,
  RecordStateMixin as Mixin,
  TypeMixin as Mixin];
