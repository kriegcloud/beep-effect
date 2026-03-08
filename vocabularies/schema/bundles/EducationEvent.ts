import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EducationEventMixin } from '../lib/EducationEvent.js';
import { EventMixin } from '../lib/Event.js';

export const EducationEventBundle = [
  EducationEventMixin as Mixin,
  EventMixin as Mixin];
