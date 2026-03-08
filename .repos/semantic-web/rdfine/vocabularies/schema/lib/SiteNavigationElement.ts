import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageElementMixin } from './WebPageElement.js';

export interface SiteNavigationElement<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPageElement<D>, rdfine.RdfResource<D> {
}

export function SiteNavigationElementMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SiteNavigationElement & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SiteNavigationElementClass extends WebPageElementMixin(Resource) {
  }
  return SiteNavigationElementClass as any
}
SiteNavigationElementMixin.appliesTo = schema.SiteNavigationElement
SiteNavigationElementMixin.createFactory = (env: RdfineEnvironment) => createFactory<SiteNavigationElement>([WebPageElementMixin, SiteNavigationElementMixin], { types: [schema.SiteNavigationElement] }, env)
