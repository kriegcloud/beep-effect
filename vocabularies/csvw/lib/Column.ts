import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface Column<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  aboutUrl: string | undefined;
  datatype: Csvw.Datatype<D> | undefined;
  datatypeLiteral: string | undefined;
  default: string | undefined;
  lang: string | undefined;
  name: string | undefined;
  null: string | undefined;
  ordered: boolean | undefined;
  propertyUrl: string | undefined;
  required: boolean | undefined;
  separator: string | undefined;
  suppressOutput: boolean | undefined;
  textDirection: Csvw.Direction<D> | undefined;
  title: RDF.Term | undefined;
  transformations: Array<Csvw.Transformation<D>>;
  valueUrl: string | undefined;
  virtual: boolean | undefined;
}

export function ColumnMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Column & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class ColumnClass extends Resource {
    @rdfine.property.literal()
    aboutUrl: string | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.Datatype] })
    datatype: Csvw.Datatype | undefined;
    @rdfine.property.literal({ path: csvw.datatype })
    datatypeLiteral: string | undefined;
    @rdfine.property.literal()
    default: string | undefined;
    @rdfine.property.literal()
    lang: string | undefined;
    @rdfine.property.literal()
    name: string | undefined;
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
    @rdfine.property.literal({ type: Boolean })
    suppressOutput: boolean | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.Direction] })
    textDirection: Csvw.Direction | undefined;
    @rdfine.property()
    title: RDF.Term | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [csvw.Transformation] })
    transformations!: Array<Csvw.Transformation>;
    @rdfine.property.literal()
    valueUrl: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    virtual: boolean | undefined;
  }
  return ColumnClass as any
}
ColumnMixin.appliesTo = csvw.Column
ColumnMixin.createFactory = (env: RdfineEnvironment) => createFactory<Column>([ColumnMixin], { types: [csvw.Column] }, env)
