import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageMixin } from './WebPage.js';

export interface CheckoutPage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPage<D>, rdfine.RdfResource<D> {
}

export function CheckoutPageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CheckoutPage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CheckoutPageClass extends WebPageMixin(Resource) {
  }
  return CheckoutPageClass as any
}
CheckoutPageMixin.appliesTo = schema.CheckoutPage
CheckoutPageMixin.createFactory = (env: RdfineEnvironment) => createFactory<CheckoutPage>([WebPageMixin, CheckoutPageMixin], { types: [schema.CheckoutPage] }, env)
