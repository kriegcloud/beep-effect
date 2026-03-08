import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CountryMixin } from '../lib/Country.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DurationMixin } from '../lib/Duration.js';
import { LanguageMixin } from '../lib/Language.js';
import { MovieMixin } from '../lib/Movie.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { VideoObjectMixin } from '../lib/VideoObject.js';

export const MovieBundle = [
  CountryMixin as Mixin,
  CreativeWorkMixin as Mixin,
  DurationMixin as Mixin,
  LanguageMixin as Mixin,
  MovieMixin as Mixin,
  MusicGroupMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  VideoObjectMixin as Mixin];
