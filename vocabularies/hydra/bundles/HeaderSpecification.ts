import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HeaderSpecificationMixin } from '../lib/HeaderSpecification.js';
import { ResourceMixin } from '../lib/Resource.js';

export const HeaderSpecificationBundle = [
  HeaderSpecificationMixin as Mixin,
  ResourceMixin as Mixin];
