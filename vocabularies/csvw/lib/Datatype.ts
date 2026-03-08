import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface Datatype<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  base: string | undefined;
  format: string | undefined;
  length: number | undefined;
  maxExclusive: number | undefined;
  maxInclusive: number | undefined;
  maxLength: number | undefined;
  minExclusive: number | undefined;
  minInclusive: number | undefined;
  minLength: number | undefined;
}

export function DatatypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Datatype & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class DatatypeClass extends Resource {
    @rdfine.property.literal()
    base: string | undefined;
    @rdfine.property.literal()
    format: string | undefined;
    @rdfine.property.literal({ type: Number })
    length: number | undefined;
    @rdfine.property.literal({ type: Number })
    maxExclusive: number | undefined;
    @rdfine.property.literal({ type: Number })
    maxInclusive: number | undefined;
    @rdfine.property.literal({ type: Number })
    maxLength: number | undefined;
    @rdfine.property.literal({ type: Number })
    minExclusive: number | undefined;
    @rdfine.property.literal({ type: Number })
    minInclusive: number | undefined;
    @rdfine.property.literal({ type: Number })
    minLength: number | undefined;
  }
  return DatatypeClass as any
}
DatatypeMixin.appliesTo = csvw.Datatype
DatatypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Datatype>([DatatypeMixin], { types: [csvw.Datatype] }, env)
