import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ServiceDescriptionMixin } from '../lib/ServiceDescription.js';
import { SoftwareAgentMixin } from '../lib/SoftwareAgent.js';

export const ServiceDescriptionBundle = [
  ServiceDescriptionMixin as Mixin,
  SoftwareAgentMixin as Mixin];
