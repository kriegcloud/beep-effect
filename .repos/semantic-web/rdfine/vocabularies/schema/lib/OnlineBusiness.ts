import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface OnlineBusiness<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function OnlineBusinessMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OnlineBusiness & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OnlineBusinessClass extends OrganizationMixin(Resource) {
  }
  return OnlineBusinessClass as any
}
OnlineBusinessMixin.appliesTo = schema.OnlineBusiness
OnlineBusinessMixin.createFactory = (env: RdfineEnvironment) => createFactory<OnlineBusiness>([OrganizationMixin, OnlineBusinessMixin], { types: [schema.OnlineBusiness] }, env)
