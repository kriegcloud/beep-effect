import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { AnnounceMixin } from '../lib/Announce.js';

export const AnnounceBundle = [
  ActivityMixin as Mixin,
  AnnounceMixin as Mixin];
