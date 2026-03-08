import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import { ObjectPropertyMixin } from './ObjectProperty.js';

export interface SymmetricProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Owl.ObjectProperty<D>, rdfine.RdfResource<D> {
}

export function SymmetricPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SymmetricProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class SymmetricPropertyClass extends ObjectPropertyMixin(Resource) {
  }
  return SymmetricPropertyClass as any
}
SymmetricPropertyMixin.appliesTo = owl.SymmetricProperty
SymmetricPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<SymmetricProperty>([ObjectPropertyMixin, SymmetricPropertyMixin], { types: [owl.SymmetricProperty] }, env)
