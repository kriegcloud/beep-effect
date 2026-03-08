import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ExtentMixin } from '../lib/Extent.js';
import { RecordResourceExtentMixin } from '../lib/RecordResourceExtent.js';

export const RecordResourceExtentBundle = [
  ExtentMixin as Mixin,
  RecordResourceExtentMixin as Mixin];
