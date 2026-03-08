import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DurationMixin } from '../lib/Duration.js';
import { MusicAlbumMixin } from '../lib/MusicAlbum.js';
import { MusicCompositionMixin } from '../lib/MusicComposition.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { MusicPlaylistMixin } from '../lib/MusicPlaylist.js';
import { MusicRecordingMixin } from '../lib/MusicRecording.js';
import { PersonMixin } from '../lib/Person.js';

export const MusicRecordingBundle = [
  CreativeWorkMixin as Mixin,
  DurationMixin as Mixin,
  MusicAlbumMixin as Mixin,
  MusicCompositionMixin as Mixin,
  MusicGroupMixin as Mixin,
  MusicPlaylistMixin as Mixin,
  MusicRecordingMixin as Mixin,
  PersonMixin as Mixin];
