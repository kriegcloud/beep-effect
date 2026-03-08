import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface Dialect<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  commentPrefix: string | undefined;
  delimiter: string | undefined;
  doubleQuote: boolean | undefined;
  encoding: string | undefined;
  header: boolean | undefined;
  headerRowCount: number | undefined;
  lineTerminators: string | undefined;
  quoteChar: string | undefined;
  skipBlankRows: boolean | undefined;
  skipColumns: number | undefined;
  skipInitialSpace: boolean | undefined;
  skipRows: number | undefined;
  trim: boolean | undefined;
}

export function DialectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Dialect & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class DialectClass extends Resource {
    @rdfine.property.literal()
    commentPrefix: string | undefined;
    @rdfine.property.literal()
    delimiter: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    doubleQuote: boolean | undefined;
    @rdfine.property.literal()
    encoding: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    header: boolean | undefined;
    @rdfine.property.literal({ type: Number })
    headerRowCount: number | undefined;
    @rdfine.property.literal()
    lineTerminators: string | undefined;
    @rdfine.property.literal()
    quoteChar: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    skipBlankRows: boolean | undefined;
    @rdfine.property.literal({ type: Number })
    skipColumns: number | undefined;
    @rdfine.property.literal({ type: Boolean })
    skipInitialSpace: boolean | undefined;
    @rdfine.property.literal({ type: Number })
    skipRows: number | undefined;
    @rdfine.property.literal({ type: Boolean })
    trim: boolean | undefined;
  }
  return DialectClass as any
}
DialectMixin.appliesTo = csvw.Dialect
DialectMixin.createFactory = (env: RdfineEnvironment) => createFactory<Dialect>([DialectMixin], { types: [csvw.Dialect] }, env)
