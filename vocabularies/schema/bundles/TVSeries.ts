import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CountryMixin } from '../lib/Country.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { CreativeWorkSeasonMixin } from '../lib/CreativeWorkSeason.js';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { EpisodeMixin } from '../lib/Episode.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { TVSeriesMixin } from '../lib/TVSeries.js';
import { VideoObjectMixin } from '../lib/VideoObject.js';

export const TVSeriesBundle = [
  CountryMixin as Mixin,
  CreativeWorkMixin as Mixin,
  CreativeWorkSeasonMixin as Mixin,
  CreativeWorkSeriesMixin as Mixin,
  EpisodeMixin as Mixin,
  MusicGroupMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  TVSeriesMixin as Mixin,
  VideoObjectMixin as Mixin];
