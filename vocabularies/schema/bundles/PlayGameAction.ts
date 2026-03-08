import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { PlayGameActionMixin } from '../lib/PlayGameAction.js';

export const PlayGameActionBundle = [
  ConsumeActionMixin as Mixin,
  PlayGameActionMixin as Mixin];
