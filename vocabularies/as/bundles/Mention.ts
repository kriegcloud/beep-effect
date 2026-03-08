import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LinkMixin } from '../lib/Link.js';
import { MentionMixin } from '../lib/Mention.js';

export const MentionBundle = [
  LinkMixin as Mixin,
  MentionMixin as Mixin];
