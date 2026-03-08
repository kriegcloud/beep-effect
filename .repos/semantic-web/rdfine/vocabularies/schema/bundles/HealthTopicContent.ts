import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HealthTopicContentMixin } from '../lib/HealthTopicContent.js';
import { WebContentMixin } from '../lib/WebContent.js';

export const HealthTopicContentBundle = [
  HealthTopicContentMixin as Mixin,
  WebContentMixin as Mixin];
