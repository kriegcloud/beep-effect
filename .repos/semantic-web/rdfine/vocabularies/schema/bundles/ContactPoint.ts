import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { GeoShapeMixin } from '../lib/GeoShape.js';
import { LanguageMixin } from '../lib/Language.js';
import { OpeningHoursSpecificationMixin } from '../lib/OpeningHoursSpecification.js';
import { PlaceMixin } from '../lib/Place.js';
import { ProductMixin } from '../lib/Product.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const ContactPointBundle = [
  AdministrativeAreaMixin as Mixin,
  ContactPointMixin as Mixin,
  GeoShapeMixin as Mixin,
  LanguageMixin as Mixin,
  OpeningHoursSpecificationMixin as Mixin,
  PlaceMixin as Mixin,
  ProductMixin as Mixin,
  StructuredValueMixin as Mixin];
