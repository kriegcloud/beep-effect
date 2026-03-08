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

export interface DeprecatedProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdf.Property<D>, rdfine.RdfResource<D> {
}

export function DeprecatedPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DeprecatedProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class DeprecatedPropertyClass extends PropertyMixinEx(RdfPropertyMixin(Resource)) {
  }
  return DeprecatedPropertyClass as any
}
DeprecatedPropertyMixin.appliesTo = owl.DeprecatedProperty
DeprecatedPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<DeprecatedProperty>([RdfPropertyMixin, DeprecatedPropertyMixin], { types: [owl.DeprecatedProperty] }, env)
