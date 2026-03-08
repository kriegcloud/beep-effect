import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DirectQueryServiceMixin } from '../lib/DirectQueryService.js';
import { SoftwareAgentMixin } from '../lib/SoftwareAgent.js';

export const DirectQueryServiceBundle = [
  DirectQueryServiceMixin as Mixin,
  SoftwareAgentMixin as Mixin];
