import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PublicationIssueMixin } from './PublicationIssue.js';

export interface ComicIssue<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PublicationIssue<D>, rdfine.RdfResource<D> {
  artist: Schema.Person<D> | undefined;
  colorist: Schema.Person<D> | undefined;
  inker: Schema.Person<D> | undefined;
  letterer: Schema.Person<D> | undefined;
  penciler: Schema.Person<D> | undefined;
  variantCover: string | undefined;
}

export function ComicIssueMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ComicIssue & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ComicIssueClass extends PublicationIssueMixin(Resource) {
    @rdfine.property.resource()
    artist: Schema.Person | undefined;
    @rdfine.property.resource()
    colorist: Schema.Person | undefined;
    @rdfine.property.resource()
    inker: Schema.Person | undefined;
    @rdfine.property.resource()
    letterer: Schema.Person | undefined;
    @rdfine.property.resource()
    penciler: Schema.Person | undefined;
    @rdfine.property.literal()
    variantCover: string | undefined;
  }
  return ComicIssueClass as any
}
ComicIssueMixin.appliesTo = schema.ComicIssue
ComicIssueMixin.createFactory = (env: RdfineEnvironment) => createFactory<ComicIssue>([PublicationIssueMixin, ComicIssueMixin], { types: [schema.ComicIssue] }, env)
