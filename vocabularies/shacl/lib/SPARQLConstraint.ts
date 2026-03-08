import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { SPARQLSelectExecutableMixin } from './SPARQLSelectExecutable.js';

export interface SPARQLConstraint<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.SPARQLSelectExecutable<D>, rdfine.RdfResource<D> {
}

export function SPARQLConstraintMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLConstraint & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLConstraintClass extends SPARQLSelectExecutableMixin(Resource) {
  }
  return SPARQLConstraintClass as any
}
SPARQLConstraintMixin.appliesTo = sh.SPARQLConstraint
SPARQLConstraintMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLConstraint>([SPARQLSelectExecutableMixin, SPARQLConstraintMixin], { types: [sh.SPARQLConstraint] }, env)
