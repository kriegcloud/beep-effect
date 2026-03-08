import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CDCPMDRecordMixin } from '../lib/CDCPMDRecord.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const CDCPMDRecordBundle = [
  CDCPMDRecordMixin as Mixin,
  StructuredValueMixin as Mixin];
