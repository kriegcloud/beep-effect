import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdf from '../index.js';

export interface Statement<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  object: RDF.Term | undefined;
  predicate: RDF.Term | undefined;
  subject: RDF.Term | undefined;
}

export function StatementMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Statement & RdfResourceCore> & Base {
  @rdfine.namespace(rdf)
  class StatementClass extends Resource {
    @rdfine.property()
    object: RDF.Term | undefined;
    @rdfine.property()
    predicate: RDF.Term | undefined;
    @rdfine.property()
    subject: RDF.Term | undefined;
  }
  return StatementClass as any
}
StatementMixin.appliesTo = rdf.Statement
StatementMixin.createFactory = (env: RdfineEnvironment) => createFactory<Statement>([StatementMixin], { types: [rdf.Statement] }, env)
