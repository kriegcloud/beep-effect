import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdf } from '@tpluscode/rdf-ns-builders';
import { owl } from '../../lib/namespace.js';
import type * as Owl from '../../index.js';
import type * as Rdf from '@rdfine/rdf';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

interface PropertyEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  equivalentProperty: Array<Rdf.Property<D>>;
  propertyDisjointWith: Array<Rdf.Property<D>>;
}

declare module '@rdfine/rdf/lib/Property' {
  interface Property<D extends RDF.DatasetCore> extends PropertyEx<D> {
  }
}

export function PropertyMixinEx<Base extends rdfine.ExtendingConstructor<Rdf.Property, PropertyEx>>(Resource: Base): rdfine.Constructor<PropertyEx & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class Impl extends Resource implements PropertyEx {
    @rdfine.property.resource({ values: 'array', as: [RdfPropertyMixin] })
    equivalentProperty!: Array<Rdf.Property>;
    @rdfine.property.resource({ values: 'array', as: [RdfPropertyMixin] })
    propertyDisjointWith!: Array<Rdf.Property>;
  }
  return Impl
}
PropertyMixinEx.appliesTo = rdf.Property
