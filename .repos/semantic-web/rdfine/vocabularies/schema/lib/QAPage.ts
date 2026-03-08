import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageMixin } from './WebPage.js';

export interface QAPage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPage<D>, rdfine.RdfResource<D> {
}

export function QAPageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<QAPage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class QAPageClass extends WebPageMixin(Resource) {
  }
  return QAPageClass as any
}
QAPageMixin.appliesTo = schema.QAPage
QAPageMixin.createFactory = (env: RdfineEnvironment) => createFactory<QAPage>([WebPageMixin, QAPageMixin], { types: [schema.QAPage] }, env)
