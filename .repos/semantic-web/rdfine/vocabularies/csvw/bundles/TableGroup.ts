import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DatatypeMixin } from '../lib/Datatype.js';
import { DialectMixin } from '../lib/Dialect.js';
import { DirectionMixin } from '../lib/Direction.js';
import { SchemaMixin } from '../lib/Schema.js';
import { TableGroupMixin } from '../lib/TableGroup.js';
import { TableMixin } from '../lib/Table.js';
import { TransformationMixin } from '../lib/Transformation.js';

export const TableGroupBundle = [
  DatatypeMixin as Mixin,
  DialectMixin as Mixin,
  DirectionMixin as Mixin,
  SchemaMixin as Mixin,
  TableGroupMixin as Mixin,
  TableMixin as Mixin,
  TransformationMixin as Mixin];
