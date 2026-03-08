import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DataCatalogMixin } from '../lib/DataCatalog.js';
import { DataDownloadMixin } from '../lib/DataDownload.js';
import { DatasetMixin } from '../lib/Dataset.js';
import { PropertyValueMixin } from '../lib/PropertyValue.js';

export const DatasetBundle = [
  CreativeWorkMixin as Mixin,
  DataCatalogMixin as Mixin,
  DataDownloadMixin as Mixin,
  DatasetMixin as Mixin,
  PropertyValueMixin as Mixin];
