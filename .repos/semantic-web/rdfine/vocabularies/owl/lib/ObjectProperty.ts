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
import { ListMixin as RdfListMixin } from '@rdfine/rdf/lib/List';

export interface ObjectProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdf.Property<D>, rdfine.RdfResource<D> {
  inverseOf: Owl.ObjectProperty<D> | undefined;
  propertyChainAxiom: Rdf.List<D> | undefined;
}

export function ObjectPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ObjectProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class ObjectPropertyClass extends PropertyMixinEx(RdfPropertyMixin(Resource)) {
    @rdfine.property.resource({ as: [ObjectPropertyMixin] })
    inverseOf: Owl.ObjectProperty | undefined;
    @rdfine.property.resource({ as: [RdfListMixin] })
    propertyChainAxiom: Rdf.List | undefined;
  }
  return ObjectPropertyClass as any
}
ObjectPropertyMixin.appliesTo = owl.ObjectProperty
ObjectPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<ObjectProperty>([RdfPropertyMixin, ObjectPropertyMixin], { types: [owl.ObjectProperty] }, env)
