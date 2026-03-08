import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MusicAlbumMixin } from '../lib/MusicAlbum.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { MusicPlaylistMixin } from '../lib/MusicPlaylist.js';
import { MusicReleaseMixin } from '../lib/MusicRelease.js';
import { PersonMixin } from '../lib/Person.js';

export const MusicAlbumBundle = [
  MusicAlbumMixin as Mixin,
  MusicGroupMixin as Mixin,
  MusicPlaylistMixin as Mixin,
  MusicReleaseMixin as Mixin,
  PersonMixin as Mixin];
