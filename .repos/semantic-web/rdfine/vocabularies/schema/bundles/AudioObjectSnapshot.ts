import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudioObjectMixin } from '../lib/AudioObject.js';
import { AudioObjectSnapshotMixin } from '../lib/AudioObjectSnapshot.js';

export const AudioObjectSnapshotBundle = [
  AudioObjectMixin as Mixin,
  AudioObjectSnapshotMixin as Mixin];
