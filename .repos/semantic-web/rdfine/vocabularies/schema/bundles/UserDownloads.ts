import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { UserDownloadsMixin } from '../lib/UserDownloads.js';
import { UserInteractionMixin } from '../lib/UserInteraction.js';

export const UserDownloadsBundle = [
  UserDownloadsMixin as Mixin,
  UserInteractionMixin as Mixin];
