import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DatatypeMixin } from '../lib/Datatype.js';
import { DialectMixin } from '../lib/Dialect.js';
import { DirectionMixin } from '../lib/Direction.js';
import { ForeignKeyMixin } from '../lib/ForeignKey.js';
import { RowMixin } from '../lib/Row.js';
import { SchemaMixin } from '../lib/Schema.js';
import { TableMixin } from '../lib/Table.js';
import { TransformationMixin } from '../lib/Transformation.js';

export const TableBundle = [
  DatatypeMixin as Mixin,
  DialectMixin as Mixin,
  DirectionMixin as Mixin,
  ForeignKeyMixin as Mixin,
  RowMixin as Mixin,
  SchemaMixin as Mixin,
  TableMixin as Mixin,
  TransformationMixin as Mixin];
