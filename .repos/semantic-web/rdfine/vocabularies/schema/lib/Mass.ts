import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { QuantityMixin } from './Quantity.js';

export interface Mass<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Quantity<D>, rdfine.RdfResource<D> {
}

export function MassMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Mass & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MassClass extends QuantityMixin(Resource) {
  }
  return MassClass as any
}
MassMixin.appliesTo = schema.Mass
MassMixin.createFactory = (env: RdfineEnvironment) => createFactory<Mass>([QuantityMixin, MassMixin], { types: [schema.Mass] }, env)
