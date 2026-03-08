import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { ViewMixin } from '../lib/View.js';

export const ViewBundle = [
  ActivityMixin as Mixin,
  ViewMixin as Mixin];
