import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';

export interface VariableRepresentation<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function VariableRepresentationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VariableRepresentation & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class VariableRepresentationClass extends Resource {
  }
  return VariableRepresentationClass as any
}
VariableRepresentationMixin.appliesTo = hydra.VariableRepresentation
VariableRepresentationMixin.createFactory = (env: RdfineEnvironment) => createFactory<VariableRepresentation>([VariableRepresentationMixin], { types: [hydra.VariableRepresentation] }, env)
