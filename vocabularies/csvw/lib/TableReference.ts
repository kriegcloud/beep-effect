import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface TableReference<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  columnReference: string | undefined;
  resource: string | undefined;
  schemaReference: string | undefined;
}

export function TableReferenceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TableReference & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class TableReferenceClass extends Resource {
    @rdfine.property.literal()
    columnReference: string | undefined;
    @rdfine.property.literal()
    resource: string | undefined;
    @rdfine.property.literal()
    schemaReference: string | undefined;
  }
  return TableReferenceClass as any
}
TableReferenceMixin.appliesTo = csvw.TableReference
TableReferenceMixin.createFactory = (env: RdfineEnvironment) => createFactory<TableReference>([TableReferenceMixin], { types: [csvw.TableReference] }, env)
