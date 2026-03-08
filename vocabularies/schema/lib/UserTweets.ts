import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UserInteractionMixin } from './UserInteraction.js';

export interface UserTweets<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UserInteraction<D>, rdfine.RdfResource<D> {
}

export function UserTweetsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserTweets & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UserTweetsClass extends UserInteractionMixin(Resource) {
  }
  return UserTweetsClass as any
}
UserTweetsMixin.appliesTo = schema.UserTweets
UserTweetsMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserTweets>([UserInteractionMixin, UserTweetsMixin], { types: [schema.UserTweets] }, env)
