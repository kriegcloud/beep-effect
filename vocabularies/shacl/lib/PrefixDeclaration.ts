import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface PrefixDeclaration<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  namespace: string | undefined;
  prefix: string | undefined;
}

export function PrefixDeclarationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PrefixDeclaration & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class PrefixDeclarationClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.literal()
    namespace: string | undefined;
    @rdfine.property.literal()
    prefix: string | undefined;
  }
  return PrefixDeclarationClass as any
}
PrefixDeclarationMixin.appliesTo = sh.PrefixDeclaration
PrefixDeclarationMixin.createFactory = (env: RdfineEnvironment) => createFactory<PrefixDeclaration>([RdfsResourceMixin, PrefixDeclarationMixin], { types: [sh.PrefixDeclaration] }, env)
