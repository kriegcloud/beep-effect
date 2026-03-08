import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CommentMixin } from '../lib/Comment.js';
import { InformActionMixin } from '../lib/InformAction.js';
import { RsvpActionMixin } from '../lib/RsvpAction.js';

export const RsvpActionBundle = [
  CommentMixin as Mixin,
  InformActionMixin as Mixin,
  RsvpActionMixin as Mixin];
