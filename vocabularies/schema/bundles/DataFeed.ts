import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DataFeedItemMixin } from '../lib/DataFeedItem.js';
import { DataFeedMixin } from '../lib/DataFeed.js';
import { DatasetMixin } from '../lib/Dataset.js';
import { ThingMixin } from '../lib/Thing.js';

export const DataFeedBundle = [
  DataFeedItemMixin as Mixin,
  DataFeedMixin as Mixin,
  DatasetMixin as Mixin,
  ThingMixin as Mixin];
