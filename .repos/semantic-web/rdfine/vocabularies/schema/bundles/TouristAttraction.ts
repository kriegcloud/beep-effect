import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { LanguageMixin } from '../lib/Language.js';
import { PlaceMixin } from '../lib/Place.js';
import { TouristAttractionMixin } from '../lib/TouristAttraction.js';

export const TouristAttractionBundle = [
  AudienceMixin as Mixin,
  LanguageMixin as Mixin,
  PlaceMixin as Mixin,
  TouristAttractionMixin as Mixin];
