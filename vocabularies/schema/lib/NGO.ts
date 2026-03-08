import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface NGO<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function NGOMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NGO & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NGOClass extends OrganizationMixin(Resource) {
  }
  return NGOClass as any
}
NGOMixin.appliesTo = schema.NGO
NGOMixin.createFactory = (env: RdfineEnvironment) => createFactory<NGO>([OrganizationMixin, NGOMixin], { types: [schema.NGO] }, env)
