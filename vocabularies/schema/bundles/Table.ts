import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { TableMixin } from '../lib/Table.js';
import { WebPageElementMixin } from '../lib/WebPageElement.js';

export const TableBundle = [
  TableMixin as Mixin,
  WebPageElementMixin as Mixin];
