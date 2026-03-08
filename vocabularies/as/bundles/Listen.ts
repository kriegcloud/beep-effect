import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { ListenMixin } from '../lib/Listen.js';

export const ListenBundle = [
  ActivityMixin as Mixin,
  ListenMixin as Mixin];
