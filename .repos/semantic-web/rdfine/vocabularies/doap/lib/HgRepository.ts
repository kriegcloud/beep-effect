import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';
import { RepositoryMixin } from './Repository.js';

export interface HgRepository<D extends RDF.DatasetCore = RDF.DatasetCore> extends Doap.Repository<D>, rdfine.RdfResource<D> {
}

export function HgRepositoryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HgRepository & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class HgRepositoryClass extends RepositoryMixin(Resource) {
  }
  return HgRepositoryClass as any
}
HgRepositoryMixin.appliesTo = doap.HgRepository
HgRepositoryMixin.createFactory = (env: RdfineEnvironment) => createFactory<HgRepository>([RepositoryMixin, HgRepositoryMixin], { types: [doap.HgRepository] }, env)
