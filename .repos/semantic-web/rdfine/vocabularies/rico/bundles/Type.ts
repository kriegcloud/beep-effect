import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConceptMixin } from '../lib/Concept.js';
import { RecordSetMixin } from '../lib/RecordSet.js';
import { ThingMixin } from '../lib/Thing.js';
import { TypeMixin } from '../lib/Type.js';

export const TypeBundle = [
  ConceptMixin as Mixin,
  RecordSetMixin as Mixin,
  ThingMixin as Mixin,
  TypeMixin as Mixin];
