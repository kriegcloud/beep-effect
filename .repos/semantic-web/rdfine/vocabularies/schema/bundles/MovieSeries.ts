import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { MovieSeriesMixin } from '../lib/MovieSeries.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { VideoObjectMixin } from '../lib/VideoObject.js';

export const MovieSeriesBundle = [
  CreativeWorkSeriesMixin as Mixin,
  MovieSeriesMixin as Mixin,
  MusicGroupMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  VideoObjectMixin as Mixin];
