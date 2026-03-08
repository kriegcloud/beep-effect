import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';

export interface Project<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function ProjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Project & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class ProjectClass extends Resource {
  }
  return ProjectClass as any
}
ProjectMixin.appliesTo = foaf.Project
ProjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<Project>([ProjectMixin], { types: [foaf.Project] }, env)
