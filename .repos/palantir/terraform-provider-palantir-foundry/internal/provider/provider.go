// Copyright 2025 Palantir Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package provider

import (
	"context"
	"os"

	"github.com/hashicorp/terraform-plugin-framework/datasource"
	"github.com/hashicorp/terraform-plugin-framework/path"
	"github.com/hashicorp/terraform-plugin-framework/provider"
	"github.com/hashicorp/terraform-plugin-framework/provider/schema"
	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/types"
	"github.com/oapi-codegen/oapi-codegen/v2/pkg/securityprovider"
	v2 "github.com/palantir/terraform-provider-palantir-foundry/gateway-client/v2"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/auth"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/enrollment"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/group"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/marking"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/organization"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/project"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/services"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/shared"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/space"
)

// Ensure the implementation satisfies the expected interfaces
var (
	_ provider.Provider = &FoundryProvider{}
)

// FoundryProvider is the provider implementation.
type FoundryProvider struct{}

// New creates a new provider instance
func New() provider.Provider {
	return &FoundryProvider{}
}

// Metadata returns the provider type name.
func (p *FoundryProvider) Metadata(_ context.Context, _ provider.MetadataRequest, resp *provider.MetadataResponse) {
	resp.TypeName = "foundry"
}

// Schema defines the provider-level schema for configuration data.
func (p *FoundryProvider) Schema(_ context.Context, _ provider.SchemaRequest, resp *provider.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Interact with Foundry.",
		Attributes: map[string]schema.Attribute{
			"host": schema.StringAttribute{
				Optional:    true,
				Description: "The base URL for the Foundry enrollment. Example: `https://example.palantirfoundry.com/`. If no value is set here, the provider will look for the `BASE_HOSTNAME` environment variable. When running terraform as a build from inside the targeted Foundry enrollment, this may be omitted entirely and the provider will infer the correct host automatically.",
			},
			"client_id": schema.StringAttribute{
				Optional:    true,
				Description: "The Client ID of a [Foundry OAuth client](https://www.palantir.com/docs/foundry/ontology-sdk/oauth-clients/). If no value is set here, the provider will look for the `CLIENT_ID` environment variable.",
			},
			"client_secret": schema.StringAttribute{
				Optional:    true,
				Sensitive:   true,
				Description: "The Client Secret of a [Foundry OAuth client](https://www.palantir.com/docs/foundry/ontology-sdk/oauth-clients/). If no value is set here, the provider will look for the `CLIENT_SECRET` environment variable.",
			},
			"deletions_disabled": schema.BoolAttribute{
				Optional:    true,
				Description: "An experimental provider-level flag to fully disable deletions of resources as well as the removal of resources' associated roles, members, etc.. This puts the provider a sort of `safe-mode`, preventing the removal of existing infra which can be subject to change outside the scope of your IAC management. In this mode, drift between the actual external infrastructure state and terraform's state is accepted, and applied plans might not map 1:1 with reality. As such, this flag must be used with caution. When a deletion operation is initiated on an otherwise deletable object (currently space, group, or project) and this flag is set to true then we will not remove the remote resource but will still remove remove the resource from state. On non-deletable resources, this flag being set to true will allow said resources to be removed from state while keeping the remote resource intact.",
			},
		},
	}
}

type foundryProviderModel struct {
	Host              types.String `tfsdk:"host"`
	ClientID          types.String `tfsdk:"client_id"`
	ClientSecret      types.String `tfsdk:"client_secret"`
	DeletionsDisabled types.Bool   `tfsdk:"deletions_disabled"`
}

// Configure prepares a Foundry API client for data sources and resources.
func (p *FoundryProvider) Configure(ctx context.Context, req provider.ConfigureRequest, resp *provider.ConfigureResponse) {
	var config foundryProviderModel
	diags := req.Config.Get(ctx, &config)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	if config.Host.IsUnknown() {
		resp.Diagnostics.AddAttributeError(
			path.Root("host"),
			"Unknown Foundry API Host", "Please provide the API host for Foundry in the provider configuration.")
	}

	if config.ClientID.IsUnknown() {
		resp.Diagnostics.AddAttributeError(
			path.Root("client_id"),
			"Unknown Foundry API Client ID", "Please provide the API Client ID for Foundry in the provider configuration.")
	}

	if config.ClientSecret.IsUnknown() {
		resp.Diagnostics.AddAttributeError(
			path.Root("client_secret"),
			"Unknown Foundry API Client Secret", "Please provide the API Client Secret for Foundry in the provider configuration.")
	}
	if config.DeletionsDisabled.IsUnknown() {
		resp.Diagnostics.AddAttributeError(
			path.Root("host"),
			"Unknown Deletions Disabled Flag", "Please provide the Deletions Disabled Flag in the provider configuration.")
	}

	if resp.Diagnostics.HasError() {
		return
	}

	clientID := config.ClientID.ValueString()
	clientSecret := config.ClientSecret.ValueString()

	// If no deletionsDisabled flag provided, default to false.
	var deletionsDisabled bool
	if config.DeletionsDisabled.IsNull() {
		deletionsDisabled = false
	} else {
		deletionsDisabled = config.DeletionsDisabled.ValueBool()
	}

	// Fallback to environment variables if values not set in config
	if clientID == "" {
		clientID = os.Getenv("CLIENT_ID")
	}

	if clientSecret == "" {
		clientSecret = os.Getenv("CLIENT_SECRET")
	}

	configUrls := services.ResolveUrls(config.Host.ValueString())
	if configUrls == nil {
		resp.Diagnostics.AddAttributeError(
			path.Root("host"),
			"Missing Foundry API Host", "Please provide the API host for Foundry in the provider configuration.")
	}

	if clientID == "" {
		resp.Diagnostics.AddAttributeError(
			path.Root("clientId"),
			"Missing Foundry API clientID", "Please provide the API clientID for Foundry in the provider configuration.")
	}

	if clientSecret == "" {
		resp.Diagnostics.AddAttributeError(
			path.Root("clientSecret"),
			"Missing Foundry API clientSecret", "Please provide the API clientSecret for Foundry in the provider configuration.")
	}

	if resp.Diagnostics.HasError() {
		return
	}

	tokenString, err := auth.GetAuthToken(configUrls.MultipassUrl, clientID, clientSecret)
	if err != nil {
		resp.Diagnostics.AddError(
			"Unable to retrieve Foundry API Token",
			"Unable to retrieve Foundry API Token: "+err.Error(),
		)
	}

	token, err := securityprovider.NewSecurityProviderBearerToken(tokenString)
	if err != nil {
		resp.Diagnostics.AddError(
			"Unable to convert Foundry API Token",
			"Unable to convert Foundry API Token: "+err.Error(),
		)
		return
	}
	client, err := v2.NewClientWithResponses(configUrls.ApiGatewayUrl, v2.WithRequestEditorFn(token.Intercept))

	if err != nil {
		resp.Diagnostics.AddError(
			"Unable to create Foundry API Client",
			"Unable to create Foundry API Client: "+err.Error(),
		)
		return
	}

	providerData := &shared.FoundryProviderData{
		Client: client,
		Flags: &shared.Flags{
			DeletionsDisabled: deletionsDisabled,
		},
	}

	resp.DataSourceData = providerData
	resp.ResourceData = providerData
}

// DataSources defines the data sources implemented in the provider.
func (p *FoundryProvider) DataSources(_ context.Context) []func() datasource.DataSource {
	return []func() datasource.DataSource{}
}

// Resources defines the resources implemented in the provider.
func (p *FoundryProvider) Resources(_ context.Context) []func() resource.Resource {
	return []func() resource.Resource{
		enrollment.NewEnrollmentResource,
		group.NewGroupResource,
		group.NewGroupMembershipResource,
		marking.NewMarkingResource,
		marking.NewMarkingMembershipResource,
		marking.NewMarkingRoleAssignmentsResource,
		organization.NewOrganizationResource,
		organization.NewOrganizationRoleAssignmentsResource,
		project.NewProjectResource,
		project.NewProjectMarkingsResource,
		project.NewProjectResourceRolesResource,
		project.NewProjectOrganizationsResource,
		space.NewSpaceResource,
	}
}
