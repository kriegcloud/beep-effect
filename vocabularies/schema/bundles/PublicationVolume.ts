import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { PublicationVolumeMixin } from '../lib/PublicationVolume.js';

export const PublicationVolumeBundle = [
  CreativeWorkMixin as Mixin,
  PublicationVolumeMixin as Mixin];
