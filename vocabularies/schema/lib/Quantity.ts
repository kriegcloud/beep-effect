import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Quantity<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
}

export function QuantityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Quantity & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class QuantityClass extends IntangibleMixin(Resource) {
  }
  return QuantityClass as any
}
QuantityMixin.appliesTo = schema.Quantity
QuantityMixin.createFactory = (env: RdfineEnvironment) => createFactory<Quantity>([IntangibleMixin, QuantityMixin], { types: [schema.Quantity] }, env)
