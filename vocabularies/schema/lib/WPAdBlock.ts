import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageElementMixin } from './WebPageElement.js';

export interface WPAdBlock<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPageElement<D>, rdfine.RdfResource<D> {
}

export function WPAdBlockMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WPAdBlock & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WPAdBlockClass extends WebPageElementMixin(Resource) {
  }
  return WPAdBlockClass as any
}
WPAdBlockMixin.appliesTo = schema.WPAdBlock
WPAdBlockMixin.createFactory = (env: RdfineEnvironment) => createFactory<WPAdBlock>([WebPageElementMixin, WPAdBlockMixin], { types: [schema.WPAdBlock] }, env)
