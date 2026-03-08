import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { GovernmentOfficeMixin } from './GovernmentOffice.js';

export interface PostOffice<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.GovernmentOffice<D>, rdfine.RdfResource<D> {
}

export function PostOfficeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PostOffice & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PostOfficeClass extends GovernmentOfficeMixin(Resource) {
  }
  return PostOfficeClass as any
}
PostOfficeMixin.appliesTo = schema.PostOffice
PostOfficeMixin.createFactory = (env: RdfineEnvironment) => createFactory<PostOffice>([GovernmentOfficeMixin, PostOfficeMixin], { types: [schema.PostOffice] }, env)
