import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { VideoObjectMixin } from '../lib/VideoObject.js';
import { VideoObjectSnapshotMixin } from '../lib/VideoObjectSnapshot.js';

export const VideoObjectSnapshotBundle = [
  VideoObjectMixin as Mixin,
  VideoObjectSnapshotMixin as Mixin];
