import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { InteractionCounterMixin } from '../lib/InteractionCounter.js';
import { PlaceMixin } from '../lib/Place.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { SoftwareApplicationMixin } from '../lib/SoftwareApplication.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';
import { WebSiteMixin } from '../lib/WebSite.js';

export const InteractionCounterBundle = [
  ActionMixin as Mixin,
  InteractionCounterMixin as Mixin,
  PlaceMixin as Mixin,
  PostalAddressMixin as Mixin,
  SoftwareApplicationMixin as Mixin,
  StructuredValueMixin as Mixin,
  WebSiteMixin as Mixin];
