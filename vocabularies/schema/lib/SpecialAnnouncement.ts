import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface SpecialAnnouncement<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  announcementLocation: Schema.CivicStructure<D> | Schema.LocalBusiness<D> | undefined;
  category: Schema.CategoryCode<D> | Schema.Thing<D> | undefined;
  categoryLiteral: string | undefined;
  datePosted: Date | undefined;
  diseasePreventionInfo: Schema.WebContent<D> | undefined;
  diseaseSpreadStatistics: Schema.Dataset<D> | Schema.Observation<D> | Schema.WebContent<D> | undefined;
  gettingTestedInfo: Schema.WebContent<D> | undefined;
  governmentBenefitsInfo: Schema.GovernmentService<D> | undefined;
  newsUpdatesAndGuidelines: Schema.WebContent<D> | undefined;
  publicTransportClosuresInfo: Schema.WebContent<D> | undefined;
  quarantineGuidelines: Schema.WebContent<D> | undefined;
  schoolClosuresInfo: Schema.WebContent<D> | undefined;
  travelBans: Schema.WebContent<D> | undefined;
  webFeed: Schema.DataFeed<D> | undefined;
}

export function SpecialAnnouncementMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SpecialAnnouncement & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SpecialAnnouncementClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    announcementLocation: Schema.CivicStructure | Schema.LocalBusiness | undefined;
    @rdfine.property.resource()
    category: Schema.CategoryCode | Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.category })
    categoryLiteral: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    datePosted: Date | undefined;
    @rdfine.property.resource()
    diseasePreventionInfo: Schema.WebContent | undefined;
    @rdfine.property.resource()
    diseaseSpreadStatistics: Schema.Dataset | Schema.Observation | Schema.WebContent | undefined;
    @rdfine.property.resource()
    gettingTestedInfo: Schema.WebContent | undefined;
    @rdfine.property.resource()
    governmentBenefitsInfo: Schema.GovernmentService | undefined;
    @rdfine.property.resource()
    newsUpdatesAndGuidelines: Schema.WebContent | undefined;
    @rdfine.property.resource()
    publicTransportClosuresInfo: Schema.WebContent | undefined;
    @rdfine.property.resource()
    quarantineGuidelines: Schema.WebContent | undefined;
    @rdfine.property.resource()
    schoolClosuresInfo: Schema.WebContent | undefined;
    @rdfine.property.resource()
    travelBans: Schema.WebContent | undefined;
    @rdfine.property.resource()
    webFeed: Schema.DataFeed | undefined;
  }
  return SpecialAnnouncementClass as any
}
SpecialAnnouncementMixin.appliesTo = schema.SpecialAnnouncement
SpecialAnnouncementMixin.createFactory = (env: RdfineEnvironment) => createFactory<SpecialAnnouncement>([CreativeWorkMixin, SpecialAnnouncementMixin], { types: [schema.SpecialAnnouncement] }, env)
