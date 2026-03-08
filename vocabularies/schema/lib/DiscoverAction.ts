import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FindActionMixin } from './FindAction.js';

export interface DiscoverAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FindAction<D>, rdfine.RdfResource<D> {
}

export function DiscoverActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DiscoverAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DiscoverActionClass extends FindActionMixin(Resource) {
  }
  return DiscoverActionClass as any
}
DiscoverActionMixin.appliesTo = schema.DiscoverAction
DiscoverActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DiscoverAction>([FindActionMixin, DiscoverActionMixin], { types: [schema.DiscoverAction] }, env)
