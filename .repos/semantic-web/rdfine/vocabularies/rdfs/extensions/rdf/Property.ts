import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdf } from '@tpluscode/rdf-ns-builders';
import { rdfs } from '../../lib/namespace.js';
import type * as Rdfs from '../../index.js';
import type * as Rdf from '@rdfine/rdf';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

interface PropertyEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  domain: Array<Rdfs.Class<D>>;
  range: Array<Rdfs.Class<D>>;
  subPropertyOf: Array<Rdf.Property<D>>;
}

declare module '@rdfine/rdf/lib/Property' {
  interface Property<D extends RDF.DatasetCore> extends PropertyEx<D> {
  }
}

export function PropertyMixinEx<Base extends rdfine.ExtendingConstructor<Rdf.Property, PropertyEx>>(Resource: Base): rdfine.Constructor<PropertyEx & RdfResourceCore> & Base {
  @rdfine.namespace(rdfs)
  class Impl extends Resource implements PropertyEx {
    @rdfine.property.resource({ values: 'array', implicitTypes: [rdfs.Class] })
    domain!: Array<Rdfs.Class>;
    @rdfine.property.resource({ values: 'array', implicitTypes: [rdfs.Class] })
    range!: Array<Rdfs.Class>;
    @rdfine.property.resource({ values: 'array', as: [RdfPropertyMixin] })
    subPropertyOf!: Array<Rdf.Property>;
  }
  return Impl
}
PropertyMixinEx.appliesTo = rdf.Property
