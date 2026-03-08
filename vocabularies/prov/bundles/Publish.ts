import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { PublishMixin } from '../lib/Publish.js';

export const PublishBundle = [
  ActivityMixin as Mixin,
  PublishMixin as Mixin];
