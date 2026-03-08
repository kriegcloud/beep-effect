import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UserInteractionMixin } from './UserInteraction.js';

export interface UserCheckins<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UserInteraction<D>, rdfine.RdfResource<D> {
}

export function UserCheckinsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserCheckins & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UserCheckinsClass extends UserInteractionMixin(Resource) {
  }
  return UserCheckinsClass as any
}
UserCheckinsMixin.appliesTo = schema.UserCheckins
UserCheckinsMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserCheckins>([UserInteractionMixin, UserCheckinsMixin], { types: [schema.UserCheckins] }, env)
