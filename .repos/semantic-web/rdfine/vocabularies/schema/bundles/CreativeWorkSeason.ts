import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { CreativeWorkSeasonMixin } from '../lib/CreativeWorkSeason.js';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { EpisodeMixin } from '../lib/Episode.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { VideoObjectMixin } from '../lib/VideoObject.js';

export const CreativeWorkSeasonBundle = [
  CreativeWorkMixin as Mixin,
  CreativeWorkSeasonMixin as Mixin,
  CreativeWorkSeriesMixin as Mixin,
  EpisodeMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  VideoObjectMixin as Mixin];
