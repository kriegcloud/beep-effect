import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { RepresentationTypeMixin } from '../lib/RepresentationType.js';
import { TypeMixin } from '../lib/Type.js';

export const RepresentationTypeBundle = [
  InstantiationMixin as Mixin,
  RepresentationTypeMixin as Mixin,
  TypeMixin as Mixin];
