import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageMixin } from './WebPage.js';

export interface ContactPage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPage<D>, rdfine.RdfResource<D> {
}

export function ContactPageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ContactPage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ContactPageClass extends WebPageMixin(Resource) {
  }
  return ContactPageClass as any
}
ContactPageMixin.appliesTo = schema.ContactPage
ContactPageMixin.createFactory = (env: RdfineEnvironment) => createFactory<ContactPage>([WebPageMixin, ContactPageMixin], { types: [schema.ContactPage] }, env)
