import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface WebSite<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  issn: string | undefined;
}

export function WebSiteMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WebSite & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WebSiteClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.literal()
    issn: string | undefined;
  }
  return WebSiteClass as any
}
WebSiteMixin.appliesTo = schema.WebSite
WebSiteMixin.createFactory = (env: RdfineEnvironment) => createFactory<WebSite>([CreativeWorkMixin, WebSiteMixin], { types: [schema.WebSite] }, env)
