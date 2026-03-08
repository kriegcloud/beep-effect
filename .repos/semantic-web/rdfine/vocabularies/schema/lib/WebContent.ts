import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface WebContent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function WebContentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WebContent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WebContentClass extends CreativeWorkMixin(Resource) {
  }
  return WebContentClass as any
}
WebContentMixin.appliesTo = schema.WebContent
WebContentMixin.createFactory = (env: RdfineEnvironment) => createFactory<WebContent>([CreativeWorkMixin, WebContentMixin], { types: [schema.WebContent] }, env)
