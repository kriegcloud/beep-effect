import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContainerMixin } from '../lib/Container.js';
import { ResourceMixin } from '../lib/Resource.js';

export const ContainerBundle = [
  ContainerMixin as Mixin,
  ResourceMixin as Mixin];
