import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface NewsMediaOrganization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
  actionableFeedbackPolicy: Schema.CreativeWork<D> | undefined;
  correctionsPolicy: Schema.CreativeWork<D> | undefined;
  diversityPolicy: Schema.CreativeWork<D> | undefined;
  diversityStaffingReport: Schema.Article<D> | undefined;
  ethicsPolicy: Schema.CreativeWork<D> | undefined;
  masthead: Schema.CreativeWork<D> | undefined;
  missionCoveragePrioritiesPolicy: Schema.CreativeWork<D> | undefined;
  noBylinesPolicy: Schema.CreativeWork<D> | undefined;
  ownershipFundingInfo: Schema.AboutPage<D> | Schema.CreativeWork<D> | undefined;
  ownershipFundingInfoLiteral: string | undefined;
  unnamedSourcesPolicy: Schema.CreativeWork<D> | undefined;
  verificationFactCheckingPolicy: Schema.CreativeWork<D> | undefined;
}

export function NewsMediaOrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NewsMediaOrganization & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NewsMediaOrganizationClass extends OrganizationMixin(Resource) {
    @rdfine.property.resource()
    actionableFeedbackPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    correctionsPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    diversityPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    diversityStaffingReport: Schema.Article | undefined;
    @rdfine.property.resource()
    ethicsPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    masthead: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    missionCoveragePrioritiesPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    noBylinesPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    ownershipFundingInfo: Schema.AboutPage | Schema.CreativeWork | undefined;
    @rdfine.property.literal({ path: schema.ownershipFundingInfo })
    ownershipFundingInfoLiteral: string | undefined;
    @rdfine.property.resource()
    unnamedSourcesPolicy: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    verificationFactCheckingPolicy: Schema.CreativeWork | undefined;
  }
  return NewsMediaOrganizationClass as any
}
NewsMediaOrganizationMixin.appliesTo = schema.NewsMediaOrganization
NewsMediaOrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<NewsMediaOrganization>([OrganizationMixin, NewsMediaOrganizationMixin], { types: [schema.NewsMediaOrganization] }, env)
