import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { CreativeWorkSeasonMixin } from '../lib/CreativeWorkSeason.js';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { DurationMixin } from '../lib/Duration.js';
import { EpisodeMixin } from '../lib/Episode.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { VideoObjectMixin } from '../lib/VideoObject.js';

export const EpisodeBundle = [
  CreativeWorkMixin as Mixin,
  CreativeWorkSeasonMixin as Mixin,
  CreativeWorkSeriesMixin as Mixin,
  DurationMixin as Mixin,
  EpisodeMixin as Mixin,
  MusicGroupMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  VideoObjectMixin as Mixin];
