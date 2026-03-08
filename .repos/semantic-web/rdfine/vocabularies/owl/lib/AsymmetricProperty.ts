import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import { ObjectPropertyMixin } from './ObjectProperty.js';

export interface AsymmetricProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Owl.ObjectProperty<D>, rdfine.RdfResource<D> {
}

export function AsymmetricPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AsymmetricProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class AsymmetricPropertyClass extends ObjectPropertyMixin(Resource) {
  }
  return AsymmetricPropertyClass as any
}
AsymmetricPropertyMixin.appliesTo = owl.AsymmetricProperty
AsymmetricPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<AsymmetricProperty>([ObjectPropertyMixin, AsymmetricPropertyMixin], { types: [owl.AsymmetricProperty] }, env)
