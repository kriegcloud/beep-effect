import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DataFeedItemMixin } from '../lib/DataFeedItem.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { ThingMixin } from '../lib/Thing.js';

export const DataFeedItemBundle = [
  DataFeedItemMixin as Mixin,
  IntangibleMixin as Mixin,
  ThingMixin as Mixin];
