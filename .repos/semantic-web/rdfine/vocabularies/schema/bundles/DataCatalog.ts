import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DataCatalogMixin } from '../lib/DataCatalog.js';
import { DatasetMixin } from '../lib/Dataset.js';

export const DataCatalogBundle = [
  CreativeWorkMixin as Mixin,
  DataCatalogMixin as Mixin,
  DatasetMixin as Mixin];
