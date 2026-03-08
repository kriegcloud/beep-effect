import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ItemListMixin } from '../lib/ItemList.js';
import { MusicAlbumMixin } from '../lib/MusicAlbum.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { MusicRecordingMixin } from '../lib/MusicRecording.js';
import { PerformingGroupMixin } from '../lib/PerformingGroup.js';
import { PersonMixin } from '../lib/Person.js';

export const MusicGroupBundle = [
  ItemListMixin as Mixin,
  MusicAlbumMixin as Mixin,
  MusicGroupMixin as Mixin,
  MusicRecordingMixin as Mixin,
  PerformingGroupMixin as Mixin,
  PersonMixin as Mixin];
