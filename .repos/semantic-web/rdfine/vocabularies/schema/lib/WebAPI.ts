import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ServiceMixin } from './Service.js';

export interface WebAPI<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Service<D>, rdfine.RdfResource<D> {
  documentation: Schema.CreativeWork<D> | undefined;
}

export function WebAPIMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WebAPI & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WebAPIClass extends ServiceMixin(Resource) {
    @rdfine.property.resource()
    documentation: Schema.CreativeWork | undefined;
  }
  return WebAPIClass as any
}
WebAPIMixin.appliesTo = schema.WebAPI
WebAPIMixin.createFactory = (env: RdfineEnvironment) => createFactory<WebAPI>([ServiceMixin, WebAPIMixin], { types: [schema.WebAPI] }, env)
