import '../extensions/rdfs/Resource.js';
import { ResourceMixinEx } from '../extensions/rdfs/Resource.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface Ontology<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  backwardCompatibleWith: Owl.Ontology<D> | undefined;
  imports: Owl.Ontology<D> | undefined;
  incompatibleWith: Owl.Ontology<D> | undefined;
  priorVersion: Owl.Ontology<D> | undefined;
  versionIRI: Owl.Ontology<D> | undefined;
}

export function OntologyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Ontology & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class OntologyClass extends ResourceMixinEx(RdfsResourceMixin(Resource)) {
    @rdfine.property.resource({ as: [OntologyMixin] })
    backwardCompatibleWith: Owl.Ontology | undefined;
    @rdfine.property.resource({ as: [OntologyMixin] })
    imports: Owl.Ontology | undefined;
    @rdfine.property.resource({ as: [OntologyMixin] })
    incompatibleWith: Owl.Ontology | undefined;
    @rdfine.property.resource({ as: [OntologyMixin] })
    priorVersion: Owl.Ontology | undefined;
    @rdfine.property.resource({ as: [OntologyMixin] })
    versionIRI: Owl.Ontology | undefined;
  }
  return OntologyClass as any
}
OntologyMixin.appliesTo = owl.Ontology
OntologyMixin.createFactory = (env: RdfineEnvironment) => createFactory<Ontology>([RdfsResourceMixin, OntologyMixin], { types: [owl.Ontology] }, env)
