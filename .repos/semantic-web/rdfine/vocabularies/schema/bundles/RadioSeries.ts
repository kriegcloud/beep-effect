import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkSeasonMixin } from '../lib/CreativeWorkSeason.js';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { EpisodeMixin } from '../lib/Episode.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { RadioSeriesMixin } from '../lib/RadioSeries.js';
import { VideoObjectMixin } from '../lib/VideoObject.js';

export const RadioSeriesBundle = [
  CreativeWorkSeasonMixin as Mixin,
  CreativeWorkSeriesMixin as Mixin,
  EpisodeMixin as Mixin,
  MusicGroupMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  RadioSeriesMixin as Mixin,
  VideoObjectMixin as Mixin];
