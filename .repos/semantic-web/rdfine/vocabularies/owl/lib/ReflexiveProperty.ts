import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import { ObjectPropertyMixin } from './ObjectProperty.js';

export interface ReflexiveProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Owl.ObjectProperty<D>, rdfine.RdfResource<D> {
}

export function ReflexivePropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReflexiveProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class ReflexivePropertyClass extends ObjectPropertyMixin(Resource) {
  }
  return ReflexivePropertyClass as any
}
ReflexivePropertyMixin.appliesTo = owl.ReflexiveProperty
ReflexivePropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReflexiveProperty>([ObjectPropertyMixin, ReflexivePropertyMixin], { types: [owl.ReflexiveProperty] }, env)
