import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { UserBlocksMixin } from '../lib/UserBlocks.js';
import { UserInteractionMixin } from '../lib/UserInteraction.js';

export const UserBlocksBundle = [
  UserBlocksMixin as Mixin,
  UserInteractionMixin as Mixin];
