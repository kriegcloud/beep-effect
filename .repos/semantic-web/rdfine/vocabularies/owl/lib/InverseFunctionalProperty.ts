import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import { ObjectPropertyMixin } from './ObjectProperty.js';

export interface InverseFunctionalProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Owl.ObjectProperty<D>, rdfine.RdfResource<D> {
}

export function InverseFunctionalPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InverseFunctionalProperty & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class InverseFunctionalPropertyClass extends ObjectPropertyMixin(Resource) {
  }
  return InverseFunctionalPropertyClass as any
}
InverseFunctionalPropertyMixin.appliesTo = owl.InverseFunctionalProperty
InverseFunctionalPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<InverseFunctionalProperty>([ObjectPropertyMixin, InverseFunctionalPropertyMixin], { types: [owl.InverseFunctionalProperty] }, env)
