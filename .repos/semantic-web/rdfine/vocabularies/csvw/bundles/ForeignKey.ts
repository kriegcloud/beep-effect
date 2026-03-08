import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ForeignKeyMixin } from '../lib/ForeignKey.js';
import { TableReferenceMixin } from '../lib/TableReference.js';

export const ForeignKeyBundle = [
  ForeignKeyMixin as Mixin,
  TableReferenceMixin as Mixin];
