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
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

export interface ResultAnnotation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  annotationProperty: Rdf.Property<D> | undefined;
  annotationValue: RDF.Term | undefined;
  annotationVarName: string | undefined;
}

export function ResultAnnotationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ResultAnnotation & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class ResultAnnotationClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    annotationProperty: Rdf.Property | undefined;
    @rdfine.property()
    annotationValue: RDF.Term | undefined;
    @rdfine.property.literal()
    annotationVarName: string | undefined;
  }
  return ResultAnnotationClass as any
}
ResultAnnotationMixin.appliesTo = sh.ResultAnnotation
ResultAnnotationMixin.createFactory = (env: RdfineEnvironment) => createFactory<ResultAnnotation>([RdfsResourceMixin, ResultAnnotationMixin], { types: [sh.ResultAnnotation] }, env)
