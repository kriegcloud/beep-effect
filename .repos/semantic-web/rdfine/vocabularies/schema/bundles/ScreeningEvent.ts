import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { LanguageMixin } from '../lib/Language.js';
import { MovieMixin } from '../lib/Movie.js';
import { ScreeningEventMixin } from '../lib/ScreeningEvent.js';

export const ScreeningEventBundle = [
  EventMixin as Mixin,
  LanguageMixin as Mixin,
  MovieMixin as Mixin,
  ScreeningEventMixin as Mixin];
