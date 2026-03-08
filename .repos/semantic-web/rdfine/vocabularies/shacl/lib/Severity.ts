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

export interface Severity<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function SeverityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Severity & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SeverityClass extends RdfsResourceMixin(Resource) {
  }
  return SeverityClass as any
}
SeverityMixin.appliesTo = sh.Severity
SeverityMixin.createFactory = (env: RdfineEnvironment) => createFactory<Severity>([RdfsResourceMixin, SeverityMixin], { types: [sh.Severity] }, env)
