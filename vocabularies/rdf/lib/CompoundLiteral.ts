import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdf from '../index.js';

export interface CompoundLiteral<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  direction: RDF.Term | undefined;
  language: RDF.Term | undefined;
}

export function CompoundLiteralMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CompoundLiteral & RdfResourceCore> & Base {
  @rdfine.namespace(rdf)
  class CompoundLiteralClass extends Resource {
    @rdfine.property()
    direction: RDF.Term | undefined;
    @rdfine.property()
    language: RDF.Term | undefined;
  }
  return CompoundLiteralClass as any
}
CompoundLiteralMixin.appliesTo = rdf.CompoundLiteral
CompoundLiteralMixin.createFactory = (env: RdfineEnvironment) => createFactory<CompoundLiteral>([CompoundLiteralMixin], { types: [rdf.CompoundLiteral] }, env)
