import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface SearchAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
  query: string | undefined;
}

export function SearchActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SearchAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SearchActionClass extends ActionMixin(Resource) {
    @rdfine.property.literal()
    query: string | undefined;
  }
  return SearchActionClass as any
}
SearchActionMixin.appliesTo = schema.SearchAction
SearchActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<SearchAction>([ActionMixin, SearchActionMixin], { types: [schema.SearchAction] }, env)
