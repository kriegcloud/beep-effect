import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from '@tpluscode/rdf-ns-builders';
import { owl } from '../../lib/namespace.js';
import type * as Owl from '../../index.js';
import type * as Rdf from '@rdfine/rdf';
import type * as Rdfs from '@rdfine/rdfs';
import { DatatypeMixin as RdfsDatatypeMixin } from '@rdfine/rdfs/lib/Datatype';
import { ListMixin as RdfListMixin } from '@rdfine/rdf/lib/List';

interface DatatypeEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  datatypeComplementOf: Rdfs.Datatype<D> | undefined;
  onDatatype: Rdfs.Datatype<D> | undefined;
  withRestrictions: Rdf.List<D> | undefined;
}

declare module '@rdfine/rdfs/lib/Datatype' {
  interface Datatype<D extends RDF.DatasetCore> extends DatatypeEx<D> {
  }
}

export function DatatypeMixinEx<Base extends rdfine.ExtendingConstructor<Rdfs.Datatype, DatatypeEx>>(Resource: Base): rdfine.Constructor<DatatypeEx & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class Impl extends Resource implements DatatypeEx {
    @rdfine.property.resource({ as: [RdfsDatatypeMixin] })
    datatypeComplementOf: Rdfs.Datatype | undefined;
    @rdfine.property.resource({ as: [RdfsDatatypeMixin] })
    onDatatype: Rdfs.Datatype | undefined;
    @rdfine.property.resource({ as: [RdfListMixin] })
    withRestrictions: Rdf.List | undefined;
  }
  return Impl
}
DatatypeMixinEx.appliesTo = rdfs.Datatype
