import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { MusicEventMixin } from '../lib/MusicEvent.js';

export const MusicEventBundle = [
  EventMixin as Mixin,
  MusicEventMixin as Mixin];
