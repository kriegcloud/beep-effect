import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageElementMixin } from './WebPageElement.js';

export interface WPHeader<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPageElement<D>, rdfine.RdfResource<D> {
}

export function WPHeaderMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WPHeader & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WPHeaderClass extends WebPageElementMixin(Resource) {
  }
  return WPHeaderClass as any
}
WPHeaderMixin.appliesTo = schema.WPHeader
WPHeaderMixin.createFactory = (env: RdfineEnvironment) => createFactory<WPHeader>([WebPageElementMixin, WPHeaderMixin], { types: [schema.WPHeader] }, env)
