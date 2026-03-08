import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DurationMixin } from '../lib/Duration.js';
import { MusicAlbumMixin } from '../lib/MusicAlbum.js';
import { MusicPlaylistMixin } from '../lib/MusicPlaylist.js';
import { MusicReleaseMixin } from '../lib/MusicRelease.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const MusicReleaseBundle = [
  DurationMixin as Mixin,
  MusicAlbumMixin as Mixin,
  MusicPlaylistMixin as Mixin,
  MusicReleaseMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
