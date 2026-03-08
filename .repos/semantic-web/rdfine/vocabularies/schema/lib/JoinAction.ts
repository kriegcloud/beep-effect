import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InteractActionMixin } from './InteractAction.js';

export interface JoinAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InteractAction<D>, rdfine.RdfResource<D> {
  event: Schema.Event<D> | undefined;
}

export function JoinActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JoinAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class JoinActionClass extends InteractActionMixin(Resource) {
    @rdfine.property.resource()
    event: Schema.Event | undefined;
  }
  return JoinActionClass as any
}
JoinActionMixin.appliesTo = schema.JoinAction
JoinActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<JoinAction>([InteractActionMixin, JoinActionMixin], { types: [schema.JoinAction] }, env)
