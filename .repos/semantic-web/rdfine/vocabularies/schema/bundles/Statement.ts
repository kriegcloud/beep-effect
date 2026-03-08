import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { StatementMixin } from '../lib/Statement.js';

export const StatementBundle = [
  CreativeWorkMixin as Mixin,
  StatementMixin as Mixin];
