import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { ImageObjectSnapshotMixin } from '../lib/ImageObjectSnapshot.js';

export const ImageObjectSnapshotBundle = [
  ImageObjectMixin as Mixin,
  ImageObjectSnapshotMixin as Mixin];
