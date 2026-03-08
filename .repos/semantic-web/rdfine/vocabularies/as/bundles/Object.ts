import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { ImageMixin } from '../lib/Image.js';
import { LinkMixin } from '../lib/Link.js';
import { ObjectMixin } from '../lib/Object.js';

export const ObjectBundle = [
  CollectionMixin as Mixin,
  ImageMixin as Mixin,
  LinkMixin as Mixin,
  ObjectMixin as Mixin];
