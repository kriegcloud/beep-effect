import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ItemMixin } from '../lib/Item.js';
import { PostMixin } from '../lib/Post.js';

export const PostBundle = [
  ItemMixin as Mixin,
  PostMixin as Mixin];
