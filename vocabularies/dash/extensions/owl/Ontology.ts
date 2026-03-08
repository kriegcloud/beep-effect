import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from '@tpluscode/rdf-ns-builders';
import { dash } from '../../lib/namespace.js';
import type * as Dash from '../../index.js';
import type * as Owl from '@rdfine/owl';

interface OntologyEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  defaultLang: string | undefined;
}

declare module '@rdfine/owl/lib/Ontology' {
  interface Ontology<D extends RDF.DatasetCore> extends OntologyEx<D> {
  }
}

export function OntologyMixinEx<Base extends rdfine.ExtendingConstructor<Owl.Ontology, OntologyEx>>(Resource: Base): rdfine.Constructor<OntologyEx & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class Impl extends Resource implements OntologyEx {
    @rdfine.property.literal()
    defaultLang: string | undefined;
  }
  return Impl
}
OntologyMixinEx.appliesTo = owl.Ontology
