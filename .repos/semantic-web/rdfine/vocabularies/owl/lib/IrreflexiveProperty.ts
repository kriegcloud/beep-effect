import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import { ObjectPropertyMixin } from './ObjectProperty.js';

export interface IrreflexiveProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Owl.ObjectProperty<D>, rdfine.RdfResource<D> {
}

export function IrreflexivePropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<IrreflexiveProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class IrreflexivePropertyClass extends ObjectPropertyMixin(Resource) {
  }
  return IrreflexivePropertyClass as any
}
IrreflexivePropertyMixin.appliesTo = owl.IrreflexiveProperty
IrreflexivePropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<IrreflexiveProperty>([ObjectPropertyMixin, IrreflexivePropertyMixin], { types: [owl.IrreflexiveProperty] }, env)
