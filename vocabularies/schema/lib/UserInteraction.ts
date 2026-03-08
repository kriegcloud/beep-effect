import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface UserInteraction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function UserInteractionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserInteraction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UserInteractionClass extends EventMixin(Resource) {
  }
  return UserInteractionClass as any
}
UserInteractionMixin.appliesTo = schema.UserInteraction
UserInteractionMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserInteraction>([EventMixin, UserInteractionMixin], { types: [schema.UserInteraction] }, env)
