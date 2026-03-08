import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContainerMixin } from '../lib/Container.js';
import { ThreadMixin } from '../lib/Thread.js';

export const ThreadBundle = [
  ContainerMixin as Mixin,
  ThreadMixin as Mixin];
