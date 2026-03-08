import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';

export interface Repository<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  'anon-root': RDF.Literal | undefined;
  browse: RDF.Term | undefined;
  location: RDF.Term | undefined;
  repositoryOf: Doap.Project<D> | undefined;
}

export function RepositoryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Repository & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class RepositoryClass extends Resource {
    @rdfine.property()
    'anon-root': RDF.Literal | undefined;
    @rdfine.property()
    browse: RDF.Term | undefined;
    @rdfine.property()
    location: RDF.Term | undefined;
    @rdfine.property.resource({ implicitTypes: [doap.Project] })
    repositoryOf: Doap.Project | undefined;
  }
  return RepositoryClass as any
}
RepositoryMixin.appliesTo = doap.Repository
RepositoryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Repository>([RepositoryMixin], { types: [doap.Repository] }, env)
