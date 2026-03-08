import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageMixin } from './WebPage.js';

export interface AboutPage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPage<D>, rdfine.RdfResource<D> {
}

export function AboutPageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AboutPage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AboutPageClass extends WebPageMixin(Resource) {
  }
  return AboutPageClass as any
}
AboutPageMixin.appliesTo = schema.AboutPage
AboutPageMixin.createFactory = (env: RdfineEnvironment) => createFactory<AboutPage>([WebPageMixin, AboutPageMixin], { types: [schema.AboutPage] }, env)
