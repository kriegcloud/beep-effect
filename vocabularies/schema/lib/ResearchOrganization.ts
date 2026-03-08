import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface ResearchOrganization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function ResearchOrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ResearchOrganization & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ResearchOrganizationClass extends OrganizationMixin(Resource) {
  }
  return ResearchOrganizationClass as any
}
ResearchOrganizationMixin.appliesTo = schema.ResearchOrganization
ResearchOrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<ResearchOrganization>([OrganizationMixin, ResearchOrganizationMixin], { types: [schema.ResearchOrganization] }, env)
