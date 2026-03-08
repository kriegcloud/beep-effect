import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LinkMixin } from '../lib/Link.js';
import { ObjectMixin } from '../lib/Object.js';

export const LinkBundle = [
  LinkMixin as Mixin,
  ObjectMixin as Mixin];
