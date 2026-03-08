import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UserInteractionMixin } from './UserInteraction.js';

export interface UserPlays<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UserInteraction<D>, rdfine.RdfResource<D> {
}

export function UserPlaysMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserPlays & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UserPlaysClass extends UserInteractionMixin(Resource) {
  }
  return UserPlaysClass as any
}
UserPlaysMixin.appliesTo = schema.UserPlays
UserPlaysMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserPlays>([UserInteractionMixin, UserPlaysMixin], { types: [schema.UserPlays] }, env)
