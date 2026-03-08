import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';

export interface Version<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  'file-release': RDF.Term | undefined;
  os: RDF.Literal | undefined;
  platform: RDF.Literal | undefined;
  revision: RDF.Literal | undefined;
}

export function VersionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Version & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class VersionClass extends Resource {
    @rdfine.property()
    'file-release': RDF.Term | undefined;
    @rdfine.property()
    os: RDF.Literal | undefined;
    @rdfine.property()
    platform: RDF.Literal | undefined;
    @rdfine.property()
    revision: RDF.Literal | undefined;
  }
  return VersionClass as any
}
VersionMixin.appliesTo = doap.Version
VersionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Version>([VersionMixin], { types: [doap.Version] }, env)
