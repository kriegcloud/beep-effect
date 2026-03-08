import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClipMixin } from '../lib/Clip.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { CreativeWorkSeasonMixin } from '../lib/CreativeWorkSeason.js';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { EpisodeMixin } from '../lib/Episode.js';
import { HyperTocEntryMixin } from '../lib/HyperTocEntry.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { PersonMixin } from '../lib/Person.js';

export const ClipBundle = [
  ClipMixin as Mixin,
  CreativeWorkMixin as Mixin,
  CreativeWorkSeasonMixin as Mixin,
  CreativeWorkSeriesMixin as Mixin,
  EpisodeMixin as Mixin,
  HyperTocEntryMixin as Mixin,
  MusicGroupMixin as Mixin,
  PersonMixin as Mixin];
