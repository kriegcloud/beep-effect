import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdfs from '../index.js';
import { ClassMixin } from './Class.js';

export interface Datatype<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Class<D>, rdfine.RdfResource<D> {
}

export function DatatypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Datatype & RdfResourceCore> & Base {
  @rdfine.namespace(rdfs)
  class DatatypeClass extends ClassMixin(Resource) {
  }
  return DatatypeClass as any
}
DatatypeMixin.appliesTo = rdfs.Datatype
DatatypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Datatype>([ClassMixin, DatatypeMixin], { types: [rdfs.Datatype] }, env)
