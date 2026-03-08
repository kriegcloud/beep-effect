import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UserInteractionMixin } from './UserInteraction.js';

export interface UserDownloads<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UserInteraction<D>, rdfine.RdfResource<D> {
}

export function UserDownloadsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserDownloads & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UserDownloadsClass extends UserInteractionMixin(Resource) {
  }
  return UserDownloadsClass as any
}
UserDownloadsMixin.appliesTo = schema.UserDownloads
UserDownloadsMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserDownloads>([UserInteractionMixin, UserDownloadsMixin], { types: [schema.UserDownloads] }, env)
