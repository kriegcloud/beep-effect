import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Owl from '@rdfine/owl';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { OntologyMixin as OwlOntologyMixin } from '@rdfine/owl/lib/Ontology';

export interface SPARQLExecutable<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  prefixes: Owl.Ontology<D> | undefined;
}

export function SPARQLExecutableMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLExecutable & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLExecutableClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.resource({ as: [OwlOntologyMixin] })
    prefixes: Owl.Ontology | undefined;
  }
  return SPARQLExecutableClass as any
}
SPARQLExecutableMixin.appliesTo = sh.SPARQLExecutable
SPARQLExecutableMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLExecutable>([RdfsResourceMixin, SPARQLExecutableMixin], { types: [sh.SPARQLExecutable] }, env)
