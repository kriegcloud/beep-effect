import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConceptMixin } from '../lib/Concept.js';
import { ProxyMixin } from '../lib/Proxy.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RecordSetMixin } from '../lib/RecordSet.js';

export const ProxyBundle = [
  ConceptMixin as Mixin,
  ProxyMixin as Mixin,
  RecordResourceMixin as Mixin,
  RecordSetMixin as Mixin];
