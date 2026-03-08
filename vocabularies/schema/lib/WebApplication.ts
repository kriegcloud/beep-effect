import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { SoftwareApplicationMixin } from './SoftwareApplication.js';

export interface WebApplication<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.SoftwareApplication<D>, rdfine.RdfResource<D> {
  browserRequirements: string | undefined;
}

export function WebApplicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WebApplication & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WebApplicationClass extends SoftwareApplicationMixin(Resource) {
    @rdfine.property.literal()
    browserRequirements: string | undefined;
  }
  return WebApplicationClass as any
}
WebApplicationMixin.appliesTo = schema.WebApplication
WebApplicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<WebApplication>([SoftwareApplicationMixin, WebApplicationMixin], { types: [schema.WebApplication] }, env)
