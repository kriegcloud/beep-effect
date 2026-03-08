import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from '@tpluscode/rdf-ns-builders';
import { sh } from '../../lib/namespace.js';
import type * as Sh from '../../index.js';
import type * as Owl from '@rdfine/owl';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { OntologyMixin as OwlOntologyMixin } from '@rdfine/owl/lib/Ontology';

interface OntologyEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  declare: Sh.PrefixDeclaration<D> | undefined;
  entailment: Rdfs.Resource<D> | undefined;
  shapesGraph: Owl.Ontology<D> | undefined;
  suggestedShapesGraph: Owl.Ontology<D> | undefined;
}

declare module '@rdfine/owl/lib/Ontology' {
  interface Ontology<D extends RDF.DatasetCore> extends OntologyEx<D> {
  }
}

export function OntologyMixinEx<Base extends rdfine.ExtendingConstructor<Owl.Ontology, OntologyEx>>(Resource: Base): rdfine.Constructor<OntologyEx & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class Impl extends Resource implements OntologyEx {
    @rdfine.property.resource({ implicitTypes: [sh.PrefixDeclaration] })
    declare: Sh.PrefixDeclaration | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    entailment: Rdfs.Resource | undefined;
    @rdfine.property.resource({ as: [OwlOntologyMixin] })
    shapesGraph: Owl.Ontology | undefined;
    @rdfine.property.resource({ as: [OwlOntologyMixin] })
    suggestedShapesGraph: Owl.Ontology | undefined;
  }
  return Impl
}
OntologyMixinEx.appliesTo = owl.Ontology
