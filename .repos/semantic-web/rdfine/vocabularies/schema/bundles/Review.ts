import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { ItemListMixin } from '../lib/ItemList.js';
import { ListItemMixin } from '../lib/ListItem.js';
import { RatingMixin } from '../lib/Rating.js';
import { ReviewMixin } from '../lib/Review.js';
import { ThingMixin } from '../lib/Thing.js';
import { WebContentMixin } from '../lib/WebContent.js';

export const ReviewBundle = [
  CreativeWorkMixin as Mixin,
  ItemListMixin as Mixin,
  ListItemMixin as Mixin,
  RatingMixin as Mixin,
  ReviewMixin as Mixin,
  ThingMixin as Mixin,
  WebContentMixin as Mixin];
