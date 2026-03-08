import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InstantaneousEventMixin } from '../lib/InstantaneousEvent.js';
import { LocationMixin } from '../lib/Location.js';
import { RoleMixin } from '../lib/Role.js';

export const InstantaneousEventBundle = [
  InstantaneousEventMixin as Mixin,
  LocationMixin as Mixin,
  RoleMixin as Mixin];
