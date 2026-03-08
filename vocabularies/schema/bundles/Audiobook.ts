import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudiobookMixin } from '../lib/Audiobook.js';
import { AudioObjectMixin } from '../lib/AudioObject.js';
import { BookMixin } from '../lib/Book.js';
import { DurationMixin } from '../lib/Duration.js';
import { PersonMixin } from '../lib/Person.js';

export const AudiobookBundle = [
  AudiobookMixin as Mixin,
  AudioObjectMixin as Mixin,
  BookMixin as Mixin,
  DurationMixin as Mixin,
  PersonMixin as Mixin];
