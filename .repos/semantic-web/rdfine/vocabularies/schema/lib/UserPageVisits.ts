import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UserInteractionMixin } from './UserInteraction.js';

export interface UserPageVisits<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UserInteraction<D>, rdfine.RdfResource<D> {
}

export function UserPageVisitsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserPageVisits & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UserPageVisitsClass extends UserInteractionMixin(Resource) {
  }
  return UserPageVisitsClass as any
}
UserPageVisitsMixin.appliesTo = schema.UserPageVisits
UserPageVisitsMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserPageVisits>([UserInteractionMixin, UserPageVisitsMixin], { types: [schema.UserPageVisits] }, env)
