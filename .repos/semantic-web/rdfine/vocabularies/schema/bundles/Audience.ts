import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { AudienceMixin } from '../lib/Audience.js';
import { IntangibleMixin } from '../lib/Intangible.js';

export const AudienceBundle = [
  AdministrativeAreaMixin as Mixin,
  AudienceMixin as Mixin,
  IntangibleMixin as Mixin];
