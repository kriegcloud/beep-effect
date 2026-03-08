import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface InteractAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
}

export function InteractActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InteractAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InteractActionClass extends ActionMixin(Resource) {
  }
  return InteractActionClass as any
}
InteractActionMixin.appliesTo = schema.InteractAction
InteractActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<InteractAction>([ActionMixin, InteractActionMixin], { types: [schema.InteractAction] }, env)
