import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectMixin } from '../lib/Object.js';
import { PersonMixin } from '../lib/Person.js';

export const PersonBundle = [
  ObjectMixin as Mixin,
  PersonMixin as Mixin];
