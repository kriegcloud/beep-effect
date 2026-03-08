import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UserInteractionMixin } from './UserInteraction.js';

export interface UserBlocks<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UserInteraction<D>, rdfine.RdfResource<D> {
}

export function UserBlocksMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserBlocks & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UserBlocksClass extends UserInteractionMixin(Resource) {
  }
  return UserBlocksClass as any
}
UserBlocksMixin.appliesTo = schema.UserBlocks
UserBlocksMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserBlocks>([UserInteractionMixin, UserBlocksMixin], { types: [schema.UserBlocks] }, env)
