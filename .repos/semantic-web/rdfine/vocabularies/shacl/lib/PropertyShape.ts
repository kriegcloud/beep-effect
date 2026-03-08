import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import type * as Rdfs from '@rdfine/rdfs';
import { ShapeMixin } from './Shape.js';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';
import { DatatypeMixin as RdfsDatatypeMixin } from '@rdfine/rdfs/lib/Datatype';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface PropertyShape<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.Shape<D>, rdfine.RdfResource<D> {
  '_equals': Rdf.Property<D> | undefined;
  datatype: Rdfs.Datatype<D> | undefined;
  defaultValue: RDF.Term | undefined;
  description: string | undefined;
  disjoint: Rdf.Property<D> | undefined;
  flags: string | undefined;
  group: Sh.PropertyGroup<D> | undefined;
  hasValue: Array<RDF.Term>;
  languageIn: Array<string>;
  lessThan: Rdf.Property<D> | undefined;
  lessThanOrEquals: Rdf.Property<D> | undefined;
  maxCount: number | undefined;
  maxExclusive: number | undefined;
  maxInclusive: number | undefined;
  maxLength: number | undefined;
  minCount: number | undefined;
  minExclusive: number | undefined;
  minInclusive: number | undefined;
  minLength: number | undefined;
  name: string | undefined;
  order: number | undefined;
  path: Rdfs.Resource<D> | Array<Rdfs.Resource<D>> | undefined;
  pattern: string | undefined;
  uniqueLang: boolean | undefined;
}

export function PropertyShapeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PropertyShape & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class PropertyShapeClass extends ShapeMixin(Resource) {
    @rdfine.property.resource({ path: sh.equals, as: [RdfPropertyMixin] })
    '_equals': Rdf.Property | undefined;
    @rdfine.property.resource({ as: [RdfsDatatypeMixin] })
    datatype: Rdfs.Datatype | undefined;
    @rdfine.property()
    defaultValue: RDF.Term | undefined;
    @rdfine.property.literal()
    description: string | undefined;
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    disjoint: Rdf.Property | undefined;
    @rdfine.property.literal()
    flags: string | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.PropertyGroup] })
    group: Sh.PropertyGroup | undefined;
    @rdfine.property({ values: 'array' })
    hasValue!: Array<RDF.Term>;
    @rdfine.property.literal({ values: 'list' })
    languageIn!: Array<string>;
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    lessThan: Rdf.Property | undefined;
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    lessThanOrEquals: Rdf.Property | undefined;
    @rdfine.property.literal({ type: Number })
    maxCount: number | undefined;
    @rdfine.property.literal({ type: Number })
    maxExclusive: number | undefined;
    @rdfine.property.literal({ type: Number })
    maxInclusive: number | undefined;
    @rdfine.property.literal({ type: Number })
    maxLength: number | undefined;
    @rdfine.property.literal({ type: Number })
    minCount: number | undefined;
    @rdfine.property.literal({ type: Number })
    minExclusive: number | undefined;
    @rdfine.property.literal({ type: Number })
    minInclusive: number | undefined;
    @rdfine.property.literal({ type: Number })
    minLength: number | undefined;
    @rdfine.property.literal()
    name: string | undefined;
    @rdfine.property.literal({ type: Number })
    order: number | undefined;
    @rdfine.property.resource({ values: ['list', 'single'], as: [RdfsResourceMixin] })
    path: Rdfs.Resource | Array<Rdfs.Resource> | undefined;
    @rdfine.property.literal()
    pattern: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    uniqueLang: boolean | undefined;
  }
  return PropertyShapeClass as any
}
PropertyShapeMixin.appliesTo = sh.PropertyShape
PropertyShapeMixin.createFactory = (env: RdfineEnvironment) => createFactory<PropertyShape>([ShapeMixin, PropertyShapeMixin], { types: [sh.PropertyShape] }, env)
