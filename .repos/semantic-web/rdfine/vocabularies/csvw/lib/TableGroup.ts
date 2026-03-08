import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface TableGroup<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  aboutUrl: string | undefined;
  datatype: Csvw.Datatype<D> | undefined;
  datatypeLiteral: string | undefined;
  default: string | undefined;
  dialect: Csvw.Dialect<D> | undefined;
  lang: string | undefined;
  note: RDF.Term | undefined;
  null: string | undefined;
  ordered: boolean | undefined;
  propertyUrl: string | undefined;
  required: boolean | undefined;
  separator: string | undefined;
  table: Csvw.Table<D> | undefined;
  tableDirection: Csvw.Direction<D> | undefined;
  tableSchema: Csvw.Schema<D> | undefined;
  textDirection: Csvw.Direction<D> | undefined;
  transformations: Array<Csvw.Transformation<D>>;
  valueUrl: string | undefined;
}

export function TableGroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TableGroup & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class TableGroupClass extends Resource {
    @rdfine.property.literal()
    aboutUrl: string | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.Datatype] })
    datatype: Csvw.Datatype | undefined;
    @rdfine.property.literal({ path: csvw.datatype })
    datatypeLiteral: string | undefined;
    @rdfine.property.literal()
    default: string | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.Dialect] })
    dialect: Csvw.Dialect | undefined;
    @rdfine.property.literal()
    lang: string | undefined;
    @rdfine.property()
    note: RDF.Term | undefined;
    @rdfine.property.literal()
    null: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    ordered: boolean | undefined;
    @rdfine.property.literal()
    propertyUrl: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    required: boolean | undefined;
    @rdfine.property.literal()
    separator: string | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.Table] })
    table: Csvw.Table | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.Direction] })
    tableDirection: Csvw.Direction | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.Schema] })
    tableSchema: Csvw.Schema | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.Direction] })
    textDirection: Csvw.Direction | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [csvw.Transformation] })
    transformations!: Array<Csvw.Transformation>;
    @rdfine.property.literal()
    valueUrl: string | undefined;
  }
  return TableGroupClass as any
}
TableGroupMixin.appliesTo = csvw.TableGroup
TableGroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<TableGroup>([TableGroupMixin], { types: [csvw.TableGroup] }, env)
