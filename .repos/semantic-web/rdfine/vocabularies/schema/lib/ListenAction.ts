import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ConsumeActionMixin } from './ConsumeAction.js';

export interface ListenAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ConsumeAction<D>, rdfine.RdfResource<D> {
}

export function ListenActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ListenAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ListenActionClass extends ConsumeActionMixin(Resource) {
  }
  return ListenActionClass as any
}
ListenActionMixin.appliesTo = schema.ListenAction
ListenActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ListenAction>([ConsumeActionMixin, ListenActionMixin], { types: [schema.ListenAction] }, env)
