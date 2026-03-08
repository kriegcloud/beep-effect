import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface Project<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function ProjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Project & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ProjectClass extends OrganizationMixin(Resource) {
  }
  return ProjectClass as any
}
ProjectMixin.appliesTo = schema.Project
ProjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<Project>([OrganizationMixin, ProjectMixin], { types: [schema.Project] }, env)
