import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface NumericFormat<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  decimalChar: string | undefined;
  groupChar: Csvw.NumericFormat<D> | undefined;
  groupCharLiteral: string | undefined;
  pattern: string | undefined;
}

export function NumericFormatMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NumericFormat & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class NumericFormatClass extends Resource {
    @rdfine.property.literal()
    decimalChar: string | undefined;
    @rdfine.property.resource({ as: [NumericFormatMixin] })
    groupChar: Csvw.NumericFormat | undefined;
    @rdfine.property.literal({ path: csvw.groupChar })
    groupCharLiteral: string | undefined;
    @rdfine.property.literal()
    pattern: string | undefined;
  }
  return NumericFormatClass as any
}
NumericFormatMixin.appliesTo = csvw.NumericFormat
NumericFormatMixin.createFactory = (env: RdfineEnvironment) => createFactory<NumericFormat>([NumericFormatMixin], { types: [csvw.NumericFormat] }, env)
