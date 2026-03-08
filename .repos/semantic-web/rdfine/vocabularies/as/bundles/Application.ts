import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ApplicationMixin } from '../lib/Application.js';
import { ObjectMixin } from '../lib/Object.js';

export const ApplicationBundle = [
  ApplicationMixin as Mixin,
  ObjectMixin as Mixin];
