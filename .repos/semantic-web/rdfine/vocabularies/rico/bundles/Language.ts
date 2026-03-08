import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { ConceptMixin } from '../lib/Concept.js';
import { LanguageMixin } from '../lib/Language.js';
import { RecordMixin } from '../lib/Record.js';
import { RecordPartMixin } from '../lib/RecordPart.js';
import { RecordSetMixin } from '../lib/RecordSet.js';

export const LanguageBundle = [
  AgentMixin as Mixin,
  ConceptMixin as Mixin,
  LanguageMixin as Mixin,
  RecordMixin as Mixin,
  RecordPartMixin as Mixin,
  RecordSetMixin as Mixin];
