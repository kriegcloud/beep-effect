import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReactActionMixin } from './ReactAction.js';

export interface AgreeAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ReactAction<D>, rdfine.RdfResource<D> {
}

export function AgreeActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AgreeAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AgreeActionClass extends ReactActionMixin(Resource) {
  }
  return AgreeActionClass as any
}
AgreeActionMixin.appliesTo = schema.AgreeAction
AgreeActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<AgreeAction>([ReactActionMixin, AgreeActionMixin], { types: [schema.AgreeAction] }, env)
