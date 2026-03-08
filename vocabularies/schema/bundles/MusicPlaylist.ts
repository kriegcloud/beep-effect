import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { ItemListMixin } from '../lib/ItemList.js';
import { MusicPlaylistMixin } from '../lib/MusicPlaylist.js';
import { MusicRecordingMixin } from '../lib/MusicRecording.js';

export const MusicPlaylistBundle = [
  CreativeWorkMixin as Mixin,
  ItemListMixin as Mixin,
  MusicPlaylistMixin as Mixin,
  MusicRecordingMixin as Mixin];
