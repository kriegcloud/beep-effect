import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdf from '../index.js';

export interface Bag<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function BagMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Bag & RdfResourceCore> & Base {
  @rdfine.namespace(rdf)
  class BagClass extends Resource {
  }
  return BagClass as any
}
BagMixin.appliesTo = rdf.Bag
BagMixin.createFactory = (env: RdfineEnvironment) => createFactory<Bag>([BagMixin], { types: [rdf.Bag] }, env)
