import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdf from '../index.js';

export interface List<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  first: RDF.Term | undefined;
  rest: Rdf.List<D> | undefined;
}

export function ListMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<List & RdfResourceCore> & Base {
  @rdfine.namespace(rdf)
  class ListClass extends Resource {
    @rdfine.property()
    first: RDF.Term | undefined;
    @rdfine.property.resource({ as: [ListMixin] })
    rest: Rdf.List | undefined;
  }
  return ListClass as any
}
ListMixin.appliesTo = rdf.List
ListMixin.createFactory = (env: RdfineEnvironment) => createFactory<List>([ListMixin], { types: [rdf.List] }, env)
