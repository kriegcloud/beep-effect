import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface Row<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  describes: RDF.Term | undefined;
  primaryKey: string | undefined;
  referencedRow: RDF.Term | undefined;
  title: RDF.Term | undefined;
}

export function RowMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Row & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class RowClass extends Resource {
    @rdfine.property()
    describes: RDF.Term | undefined;
    @rdfine.property.literal()
    primaryKey: string | undefined;
    @rdfine.property()
    referencedRow: RDF.Term | undefined;
    @rdfine.property()
    title: RDF.Term | undefined;
  }
  return RowClass as any
}
RowMixin.appliesTo = csvw.Row
RowMixin.createFactory = (env: RdfineEnvironment) => createFactory<Row>([RowMixin], { types: [csvw.Row] }, env)
