import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import { ObjectPropertyMixin } from './ObjectProperty.js';

export interface TransitiveProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Owl.ObjectProperty<D>, rdfine.RdfResource<D> {
}

export function TransitivePropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TransitiveProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class TransitivePropertyClass extends ObjectPropertyMixin(Resource) {
  }
  return TransitivePropertyClass as any
}
TransitivePropertyMixin.appliesTo = owl.TransitiveProperty
TransitivePropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<TransitiveProperty>([ObjectPropertyMixin, TransitivePropertyMixin], { types: [owl.TransitiveProperty] }, env)
