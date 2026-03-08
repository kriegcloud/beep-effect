import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface Validator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function ValidatorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Validator & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class ValidatorClass extends RdfsResourceMixin(Resource) {
  }
  return ValidatorClass as any
}
ValidatorMixin.appliesTo = sh.Validator
ValidatorMixin.createFactory = (env: RdfineEnvironment) => createFactory<Validator>([RdfsResourceMixin, ValidatorMixin], { types: [sh.Validator] }, env)
