import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { AddMixin } from '../lib/Add.js';

export const AddBundle = [
  ActivityMixin as Mixin,
  AddMixin as Mixin];
