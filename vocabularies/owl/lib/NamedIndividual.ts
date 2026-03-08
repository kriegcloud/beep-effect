import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';

export interface NamedIndividual<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function NamedIndividualMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NamedIndividual & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class NamedIndividualClass extends Resource {
  }
  return NamedIndividualClass as any
}
NamedIndividualMixin.appliesTo = owl.NamedIndividual
NamedIndividualMixin.createFactory = (env: RdfineEnvironment) => createFactory<NamedIndividual>([NamedIndividualMixin], { types: [owl.NamedIndividual] }, env)
