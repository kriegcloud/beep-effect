import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { VisualArtsEventMixin } from '../lib/VisualArtsEvent.js';

export const VisualArtsEventBundle = [
  EventMixin as Mixin,
  VisualArtsEventMixin as Mixin];
