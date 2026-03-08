import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ArticleMixin } from './Article.js';

export interface Report<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Article<D>, rdfine.RdfResource<D> {
  reportNumber: string | undefined;
}

export function ReportMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Report & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReportClass extends ArticleMixin(Resource) {
    @rdfine.property.literal()
    reportNumber: string | undefined;
  }
  return ReportClass as any
}
ReportMixin.appliesTo = schema.Report
ReportMixin.createFactory = (env: RdfineEnvironment) => createFactory<Report>([ArticleMixin, ReportMixin], { types: [schema.Report] }, env)
