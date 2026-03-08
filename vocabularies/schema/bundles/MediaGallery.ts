import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionPageMixin } from '../lib/CollectionPage.js';
import { MediaGalleryMixin } from '../lib/MediaGallery.js';

export const MediaGalleryBundle = [
  CollectionPageMixin as Mixin,
  MediaGalleryMixin as Mixin];
