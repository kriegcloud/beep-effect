import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdf from '../index.js';

export interface Seq<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function SeqMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Seq & RdfResourceCore> & Base {
  @rdfine.namespace(rdf)
  class SeqClass extends Resource {
  }
  return SeqClass as any
}
SeqMixin.appliesTo = rdf.Seq
SeqMixin.createFactory = (env: RdfineEnvironment) => createFactory<Seq>([SeqMixin], { types: [rdf.Seq] }, env)
