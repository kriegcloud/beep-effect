import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InteractActionMixin } from './InteractAction.js';

export interface SubscribeAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InteractAction<D>, rdfine.RdfResource<D> {
}

export function SubscribeActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SubscribeAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SubscribeActionClass extends InteractActionMixin(Resource) {
  }
  return SubscribeActionClass as any
}
SubscribeActionMixin.appliesTo = schema.SubscribeAction
SubscribeActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<SubscribeAction>([InteractActionMixin, SubscribeActionMixin], { types: [schema.SubscribeAction] }, env)
