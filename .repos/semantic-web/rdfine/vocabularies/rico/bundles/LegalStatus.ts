import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { LegalStatusMixin } from '../lib/LegalStatus.js';
import { RecordMixin } from '../lib/Record.js';
import { RecordPartMixin } from '../lib/RecordPart.js';
import { RecordSetMixin } from '../lib/RecordSet.js';
import { TypeMixin } from '../lib/Type.js';

export const LegalStatusBundle = [
  AgentMixin as Mixin,
  LegalStatusMixin as Mixin,
  RecordMixin as Mixin,
  RecordPartMixin as Mixin,
  RecordSetMixin as Mixin,
  TypeMixin as Mixin];
