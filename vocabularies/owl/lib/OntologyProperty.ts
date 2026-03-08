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

export interface OntologyProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdf.Property<D>, rdfine.RdfResource<D> {
}

export function OntologyPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OntologyProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class OntologyPropertyClass extends PropertyMixinEx(RdfPropertyMixin(Resource)) {
  }
  return OntologyPropertyClass as any
}
OntologyPropertyMixin.appliesTo = owl.OntologyProperty
OntologyPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<OntologyProperty>([RdfPropertyMixin, OntologyPropertyMixin], { types: [owl.OntologyProperty] }, env)
