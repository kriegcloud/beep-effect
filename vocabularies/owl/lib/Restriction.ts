import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import type * as Rdfs from '@rdfine/rdfs';
import { ClassMixin } from './Class.js';
import { ClassMixin as RdfsClassMixin } from '@rdfine/rdfs/lib/Class';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { DatatypeMixin as RdfsDatatypeMixin } from '@rdfine/rdfs/lib/Datatype';
import { ListMixin as RdfListMixin } from '@rdfine/rdf/lib/List';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

export interface Restriction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Owl.Class<D>, rdfine.RdfResource<D> {
  allValuesFrom: Rdfs.Class<D> | undefined;
  cardinality: number | undefined;
  hasSelf: Rdfs.Resource<D> | undefined;
  hasValue: Rdfs.Resource<D> | undefined;
  maxCardinality: number | undefined;
  maxQualifiedCardinality: number | undefined;
  minCardinality: number | undefined;
  minQualifiedCardinality: number | undefined;
  onClass: Owl.Class<D> | undefined;
  onDataRange: Rdfs.Datatype<D> | undefined;
  onProperties: Rdf.List<D> | undefined;
  onProperty: Rdf.Property<D> | undefined;
  qualifiedCardinality: number | undefined;
  someValuesFrom: Rdfs.Class<D> | undefined;
}

export function RestrictionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Restriction & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class RestrictionClass extends ClassMixin(Resource) {
    @rdfine.property.resource({ as: [RdfsClassMixin] })
    allValuesFrom: Rdfs.Class | undefined;
    @rdfine.property.literal({ type: Number })
    cardinality: number | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    hasSelf: Rdfs.Resource | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    hasValue: Rdfs.Resource | undefined;
    @rdfine.property.literal({ type: Number })
    maxCardinality: number | undefined;
    @rdfine.property.literal({ type: Number })
    maxQualifiedCardinality: number | undefined;
    @rdfine.property.literal({ type: Number })
    minCardinality: number | undefined;
    @rdfine.property.literal({ type: Number })
    minQualifiedCardinality: number | undefined;
    @rdfine.property.resource({ implicitTypes: [owl.Class] })
    onClass: Owl.Class | undefined;
    @rdfine.property.resource({ as: [RdfsDatatypeMixin] })
    onDataRange: Rdfs.Datatype | undefined;
    @rdfine.property.resource({ as: [RdfListMixin] })
    onProperties: Rdf.List | undefined;
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    onProperty: Rdf.Property | undefined;
    @rdfine.property.literal({ type: Number })
    qualifiedCardinality: number | undefined;
    @rdfine.property.resource({ as: [RdfsClassMixin] })
    someValuesFrom: Rdfs.Class | undefined;
  }
  return RestrictionClass as any
}
RestrictionMixin.appliesTo = owl.Restriction
RestrictionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Restriction>([ClassMixin, RestrictionMixin], { types: [owl.Restriction] }, env)
