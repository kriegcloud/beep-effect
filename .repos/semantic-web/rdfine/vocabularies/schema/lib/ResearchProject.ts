import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ProjectMixin } from './Project.js';

export interface ResearchProject<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Project<D>, rdfine.RdfResource<D> {
}

export function ResearchProjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ResearchProject & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ResearchProjectClass extends ProjectMixin(Resource) {
  }
  return ResearchProjectClass as any
}
ResearchProjectMixin.appliesTo = schema.ResearchProject
ResearchProjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<ResearchProject>([ProjectMixin, ResearchProjectMixin], { types: [schema.ResearchProject] }, env)
