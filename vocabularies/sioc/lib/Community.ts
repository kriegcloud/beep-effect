import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';

export interface Community<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function CommunityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Community & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class CommunityClass extends Resource {
  }
  return CommunityClass as any
}
CommunityMixin.appliesTo = sioc.Community
CommunityMixin.createFactory = (env: RdfineEnvironment) => createFactory<Community>([CommunityMixin], { types: [sioc.Community] }, env)
