import '../extensions/rdf/Property.js';
import { PropertyMixinEx } from '../extensions/rdf/Property.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

export interface FunctionalProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdf.Property<D>, rdfine.RdfResource<D> {
}

export function FunctionalPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FunctionalProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class FunctionalPropertyClass extends PropertyMixinEx(RdfPropertyMixin(Resource)) {
  }
  return FunctionalPropertyClass as any
}
FunctionalPropertyMixin.appliesTo = owl.FunctionalProperty
FunctionalPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<FunctionalProperty>([RdfPropertyMixin, FunctionalPropertyMixin], { types: [owl.FunctionalProperty] }, env)
