import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DataDownloadMixin } from '../lib/DataDownload.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';

export const DataDownloadBundle = [
  DataDownloadMixin as Mixin,
  MediaObjectMixin as Mixin];
