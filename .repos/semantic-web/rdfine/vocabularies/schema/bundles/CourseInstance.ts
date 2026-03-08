import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CourseInstanceMixin } from '../lib/CourseInstance.js';
import { EventMixin } from '../lib/Event.js';
import { PersonMixin } from '../lib/Person.js';

export const CourseInstanceBundle = [
  CourseInstanceMixin as Mixin,
  EventMixin as Mixin,
  PersonMixin as Mixin];
