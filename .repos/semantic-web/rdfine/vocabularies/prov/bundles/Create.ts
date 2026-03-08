import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContributeMixin } from '../lib/Contribute.js';
import { CreateMixin } from '../lib/Create.js';

export const CreateBundle = [
  ContributeMixin as Mixin,
  CreateMixin as Mixin];
