import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CompleteDataFeedMixin } from '../lib/CompleteDataFeed.js';
import { DataFeedMixin } from '../lib/DataFeed.js';

export const CompleteDataFeedBundle = [
  CompleteDataFeedMixin as Mixin,
  DataFeedMixin as Mixin];
