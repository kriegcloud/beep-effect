import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface WebPageElement<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  cssSelector: string | undefined;
  xpath: string | undefined;
}

export function WebPageElementMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WebPageElement & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WebPageElementClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.literal()
    cssSelector: string | undefined;
    @rdfine.property.literal()
    xpath: string | undefined;
  }
  return WebPageElementClass as any
}
WebPageElementMixin.appliesTo = schema.WebPageElement
WebPageElementMixin.createFactory = (env: RdfineEnvironment) => createFactory<WebPageElement>([CreativeWorkMixin, WebPageElementMixin], { types: [schema.WebPageElement] }, env)
