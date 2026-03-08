import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UserInteractionMixin } from './UserInteraction.js';

export interface UserLikes<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UserInteraction<D>, rdfine.RdfResource<D> {
}

export function UserLikesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserLikes & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UserLikesClass extends UserInteractionMixin(Resource) {
  }
  return UserLikesClass as any
}
UserLikesMixin.appliesTo = schema.UserLikes
UserLikesMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserLikes>([UserInteractionMixin, UserLikesMixin], { types: [schema.UserLikes] }, env)
