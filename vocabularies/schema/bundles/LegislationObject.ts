import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LegislationMixin } from '../lib/Legislation.js';
import { LegislationObjectMixin } from '../lib/LegislationObject.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';

export const LegislationObjectBundle = [
  LegislationMixin as Mixin,
  LegislationObjectMixin as Mixin,
  MediaObjectMixin as Mixin];
