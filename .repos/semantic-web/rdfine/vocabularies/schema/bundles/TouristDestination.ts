import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { PlaceMixin } from '../lib/Place.js';
import { TouristAttractionMixin } from '../lib/TouristAttraction.js';
import { TouristDestinationMixin } from '../lib/TouristDestination.js';

export const TouristDestinationBundle = [
  AudienceMixin as Mixin,
  PlaceMixin as Mixin,
  TouristAttractionMixin as Mixin,
  TouristDestinationMixin as Mixin];
