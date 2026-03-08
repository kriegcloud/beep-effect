import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';
import { RepositoryMixin } from './Repository.js';

export interface DarcsRepository<D extends RDF.DatasetCore = RDF.DatasetCore> extends Doap.Repository<D>, rdfine.RdfResource<D> {
}

export function DarcsRepositoryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DarcsRepository & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class DarcsRepositoryClass extends RepositoryMixin(Resource) {
  }
  return DarcsRepositoryClass as any
}
DarcsRepositoryMixin.appliesTo = doap.DarcsRepository
DarcsRepositoryMixin.createFactory = (env: RdfineEnvironment) => createFactory<DarcsRepository>([RepositoryMixin, DarcsRepositoryMixin], { types: [doap.DarcsRepository] }, env)
