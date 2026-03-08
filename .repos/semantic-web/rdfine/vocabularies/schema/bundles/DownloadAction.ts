import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DownloadActionMixin } from '../lib/DownloadAction.js';
import { TransferActionMixin } from '../lib/TransferAction.js';

export const DownloadActionBundle = [
  DownloadActionMixin as Mixin,
  TransferActionMixin as Mixin];
