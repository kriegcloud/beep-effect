import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { CreateMixin } from '../lib/Create.js';

export const CreateBundle = [
  ActivityMixin as Mixin,
  CreateMixin as Mixin];
