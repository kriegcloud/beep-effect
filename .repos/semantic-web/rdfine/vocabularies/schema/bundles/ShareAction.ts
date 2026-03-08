import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CommunicateActionMixin } from '../lib/CommunicateAction.js';
import { ShareActionMixin } from '../lib/ShareAction.js';

export const ShareActionBundle = [
  CommunicateActionMixin as Mixin,
  ShareActionMixin as Mixin];
