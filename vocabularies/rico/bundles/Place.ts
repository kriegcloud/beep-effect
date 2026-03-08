import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { PersonMixin } from '../lib/Person.js';
import { PhysicalLocationMixin } from '../lib/PhysicalLocation.js';
import { PlaceMixin } from '../lib/Place.js';
import { PlaceNameMixin } from '../lib/PlaceName.js';
import { PlaceTypeMixin } from '../lib/PlaceType.js';
import { ThingMixin } from '../lib/Thing.js';

export const PlaceBundle = [
  AgentMixin as Mixin,
  PersonMixin as Mixin,
  PhysicalLocationMixin as Mixin,
  PlaceMixin as Mixin,
  PlaceNameMixin as Mixin,
  PlaceTypeMixin as Mixin,
  ThingMixin as Mixin];
