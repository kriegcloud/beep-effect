import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdf from '../index.js';

export interface Alt<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function AltMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Alt & RdfResourceCore> & Base {
  @rdfine.namespace(rdf)
  class AltClass extends Resource {
  }
  return AltClass as any
}
AltMixin.appliesTo = rdf.Alt
AltMixin.createFactory = (env: RdfineEnvironment) => createFactory<Alt>([AltMixin], { types: [rdf.Alt] }, env)
