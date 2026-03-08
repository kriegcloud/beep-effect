import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface ForeignKey<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  columnReference: string | undefined;
  reference: Csvw.TableReference<D> | undefined;
}

export function ForeignKeyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ForeignKey & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class ForeignKeyClass extends Resource {
    @rdfine.property.literal()
    columnReference: string | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.TableReference] })
    reference: Csvw.TableReference | undefined;
  }
  return ForeignKeyClass as any
}
ForeignKeyMixin.appliesTo = csvw.ForeignKey
ForeignKeyMixin.createFactory = (env: RdfineEnvironment) => createFactory<ForeignKey>([ForeignKeyMixin], { types: [csvw.ForeignKey] }, env)
