import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface Direction<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function DirectionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Direction & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class DirectionClass extends Resource {
  }
  return DirectionClass as any
}
DirectionMixin.appliesTo = csvw.Direction
DirectionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Direction>([DirectionMixin], { types: [csvw.Direction] }, env)
