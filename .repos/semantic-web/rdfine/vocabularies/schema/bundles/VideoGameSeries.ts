import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { CreativeWorkSeasonMixin } from '../lib/CreativeWorkSeason.js';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { EpisodeMixin } from '../lib/Episode.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { ThingMixin } from '../lib/Thing.js';
import { VideoGameSeriesMixin } from '../lib/VideoGameSeries.js';
import { VideoObjectMixin } from '../lib/VideoObject.js';

export const VideoGameSeriesBundle = [
  CreativeWorkMixin as Mixin,
  CreativeWorkSeasonMixin as Mixin,
  CreativeWorkSeriesMixin as Mixin,
  EpisodeMixin as Mixin,
  MusicGroupMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  PostalAddressMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  ThingMixin as Mixin,
  VideoGameSeriesMixin as Mixin,
  VideoObjectMixin as Mixin];
