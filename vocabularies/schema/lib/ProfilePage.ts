import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageMixin } from './WebPage.js';

export interface ProfilePage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPage<D>, rdfine.RdfResource<D> {
}

export function ProfilePageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ProfilePage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ProfilePageClass extends WebPageMixin(Resource) {
  }
  return ProfilePageClass as any
}
ProfilePageMixin.appliesTo = schema.ProfilePage
ProfilePageMixin.createFactory = (env: RdfineEnvironment) => createFactory<ProfilePage>([WebPageMixin, ProfilePageMixin], { types: [schema.ProfilePage] }, env)
