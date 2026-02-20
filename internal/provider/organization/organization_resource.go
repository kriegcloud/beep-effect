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

package organization

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/hashicorp/terraform-plugin-framework/path"
	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema"
	"github.com/hashicorp/terraform-plugin-framework/types"
	"github.com/hashicorp/terraform-plugin-log/tflog"
	v2 "github.com/palantir/terraform-provider-palantir-foundry/gateway-client/v2"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/constants"
	providerError "github.com/palantir/terraform-provider-palantir-foundry/internal/provider/errors"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/helper"
	"github.com/palantir/terraform-provider-palantir-foundry/internal/provider/shared"
)

// Ensure the implementation satisfies the expected interfaces
var (
	_ resource.Resource              = &organizationResource{}
	_ resource.ResourceWithConfigure = &organizationResource{}
)

func NewOrganizationResource() resource.Resource {
	return &organizationResource{}
}

// organizationResource is the resource implementation.
type organizationResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider data to the resource.
func (r *organizationResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
	if req.ProviderData == nil {
		return
	}

	providerData, ok := req.ProviderData.(*shared.FoundryProviderData)

	if !ok {
		resp.Diagnostics.AddError(
			"Unexpected Resource Configure Type",
			fmt.Sprintf("Expected shared.FoundryProviderData, got: %T. Please report this issue to the provider developers.", req.ProviderData),
		)

		return
	}

	r.client = providerData.Client
	r.deletionsDisabled = providerData.Flags.DeletionsDisabled
}

// Metadata returns the resource type name.
func (r *organizationResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_organization"
}

// Schema defines the schema for the resource.
func (r *organizationResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Organization.",
		Attributes: map[string]schema.Attribute{
			"rid": schema.StringAttribute{
				Description: "RID of the Organization.",
				Computed:    true,
			},
			"name": schema.StringAttribute{
				Description: "Name of the Organization.",
				Required:    true,
			},
			"marking_id": schema.StringAttribute{
				Description: "Marking ID of the Organization.",
				Computed:    true,
			},
			"enrollment_rid": schema.StringAttribute{
				Description: "The RID of the Enrollment this Organization belongs to. This field required if the resource is created within Terraform, but not necessarily if created outside of Terraform and imported.",
				Optional:    true,
			},
			"description": schema.StringAttribute{
				Description: "Description of the Organization.",
				Optional:    true,
			},
			"host_name": schema.StringAttribute{
				Description: "The primary host name of the Organization. This should be used when constructing URLs for users of this Organization.",
				Optional:    true,
			},
			"initial_administrators": schema.SetAttribute{
				Description: "The initial set of principals to be assigned the Administrator Role when creating this Organization. Any changes to this field after Organization creation will not be applied; instead, use the organization_role_assignments resource to manage the applied Role Assignments.",
				Optional:    true,
				ElementType: types.StringType,
			},
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *organizationResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	// Retrieve values from plan
	var plan organizationResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		resp.Diagnostics.Append(diags...)
		return
	}

	err := r.CreateOrganization(ctx, resp, &plan)
	if err != nil {
		resp.Diagnostics.AddError("Error creating the Organization. Please fix your plan if needed and re-apply", err.Error())
		return
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *organizationResource) CreateOrganization(ctx context.Context, resp *resource.CreateResponse, plan *organizationResourceModel) error {

	previewMode := constants.PreviewMode
	adminCreateOrganizationParams := v2.AdminCreateOrganizationParams{Preview: &previewMode}
	description := plan.Description.ValueString()
	host := plan.HostName.ValueString()

	var initialAdministrators []string
	diags := plan.InitialAdministrators.ElementsAs(ctx, &initialAdministrators, false)
	if diags.HasError() {
		return fmt.Errorf("failed to convert initial administrator roles to Go slice")
	}

	initialAdministratorsUUIDs, err := helper.ConvertStringsToUUIDs(initialAdministrators)

	if err != nil {
		return fmt.Errorf("failed to convert administrator ids to UUIDs: %w", err)
	}

	httpResp, err := r.client.AdminCreateOrganization(ctx,
		&adminCreateOrganizationParams,
		v2.AdminCreateOrganizationJSONRequestBody{
			Name:           plan.Name.ValueString(),
			Description:    &description,
			Administrators: &initialAdministratorsUUIDs,
			EnrollmentRid:  plan.EnrollmentRID.ValueString(),
			Host:           &host,
		})

	if err != nil {
		resp.Diagnostics.AddError("AdminCreateOrganization request failed", err.Error())
		return fmt.Errorf("AdminCreateOrganization request failed: %w", err)
	}
	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from AdminCreateOrganization response", err.Error())
			return fmt.Errorf("failed to format error logging from AdminCreateOrganization response: %w", err)
		}
		resp.Diagnostics.AddError("Response from AdminCreateOrganization was unsuccessful: ", returnString)
		return fmt.Errorf("response from AdminCreateOrganization was unsuccessful: %s", returnString)
	}

	//if success - take id from the response and update the state
	var httpResponseBody responseBody

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from AdminCreateOrganization", err.Error())
		return fmt.Errorf("failed to parse response from AdminCreateOrganization: %w", err)
	}
	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	//CREATE - do not save state if id is not saved
	if httpResponseBody.RID == "" {
		tflog.Error(ctx, "RID was not populated in response, "+
			"so Terraform best practice is NOT to update state as resource likely was not properly created")
		resp.Diagnostics.AddError("ID returned as empty",
			"ID was not populated in response, "+
				"so Terraform best practice is NOT to update state as resource likely was not properly created")
		return fmt.Errorf("ID returned as empty: %s", httpResponseBody.RID)
	}

	//set computed values
	plan.RID = types.StringValue(httpResponseBody.RID)
	plan.MarkingID = types.StringValue(httpResponseBody.MarkingID)
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *organizationResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state organizationResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadOrganization(ctx, resp, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Organization", err.Error())
		return
	}

	if resp.Diagnostics.Warnings().Contains(providerError.ResourceNotFoundWarning(state.RID.ValueString(), "Organization")) {
		resp.State.RemoveResource(ctx)
		return
	}

	// Set refreshed state
	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *organizationResource) ReadOrganization(ctx context.Context, resp *resource.ReadResponse, state *organizationResourceModel) error {
	previewMode := constants.PreviewMode
	adminGetOrganizationParams := v2.AdminGetOrganizationParams{Preview: &previewMode}

	httpResp, err := r.client.AdminGetOrganization(ctx, state.RID.ValueString(), &adminGetOrganizationParams)

	if err != nil {
		resp.Diagnostics.AddError("AdminGetOrganization request failed", err.Error())
		return fmt.Errorf("AdminGetOrganization request failed: %w", err)
	}

	if httpResp.StatusCode != http.StatusOK {
		if httpResp.StatusCode == http.StatusNotFound {
			resp.Diagnostics.Append(providerError.ResourceNotFoundWarning(state.RID.ValueString(), "Organization"))
			return nil
		}
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from AdminGetOrganization response", err.Error())
			return fmt.Errorf("failed to format error logging from AdminGetOrganization response: %w", err)
		}
		resp.Diagnostics.AddError("Response from AdminGetOrganization was unsuccessful: ", returnString)
		return fmt.Errorf("response from AdminGetOrganization was unsuccessful: %s", returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from AdminGetOrganization", err.Error())
		return fmt.Errorf("failed to parse response from AdminGetOrganization: %w", err)
	}

	var httpResponseBody responseBody
	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	state.RID = types.StringValue(httpResponseBody.RID)
	state.MarkingID = types.StringValue(httpResponseBody.MarkingID)
	state.Name = types.StringValue(httpResponseBody.Name)
	state.Description = helper.HandleEmptyFieldString(httpResponseBody.Description)
	state.HostName = helper.HandleEmptyFieldString(httpResponseBody.Host)
	return nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *organizationResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan organizationResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state organizationResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	if !plan.InitialAdministrators.Equal(state.InitialAdministrators) {
		resp.Diagnostics.AddError("Initial administrators cannot be updated after creation. Any changes will not be applied.",
			"Initial administrators cannot be updated after creation. Any changes will not be applied.")
	}

	err := r.UpdateOrganization(ctx, resp, &plan, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Organization. Please fix your plan if needed and re-apply", err.Error())
		return
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *organizationResource) UpdateOrganization(ctx context.Context, resp *resource.UpdateResponse, plan *organizationResourceModel, state *organizationResourceModel) error {
	if state.EnrollmentRID != plan.EnrollmentRID {
		return fmt.Errorf("you may not change the Enrollment RID of an Organization once it has been created. Please revert your plan to the existing Enrollment RID and re-apply")
	}
	previewMode := constants.PreviewMode

	adminReplaceOrganizationParams := v2.AdminReplaceOrganizationParams{Preview: &previewMode}
	description := plan.Description.ValueString()
	host := plan.HostName.ValueString()

	httpResp, err := r.client.AdminReplaceOrganization(ctx, state.RID.ValueString(), &adminReplaceOrganizationParams, v2.AdminReplaceOrganizationJSONRequestBody{
		Name:        plan.Name.ValueString(),
		Description: &description,
		Host:        &host,
	})

	if err != nil {
		resp.Diagnostics.AddError("AdminReplaceOrganization request failed", err.Error())
		return fmt.Errorf("AdminReplaceOrganization request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from AdminReplaceOrganization response", err.Error())
			return fmt.Errorf("failed to format error logging from AdminReplaceOrganization response: %w", err)
		}
		resp.Diagnostics.AddError("Response from AdminReplaceOrganization was unsuccessful: ", returnString)
		return fmt.Errorf("response from AdminReplaceOrganization was unsuccessful: %s", returnString)
	}

	//read body and then close
	var httpResponseBody responseBody

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from AdminReplaceOrganization", err.Error())
		return fmt.Errorf("failed to parse response from AdminReplaceOrganization: %w", err)
	}

	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	// Update the state with the new values

	state.Name = types.StringValue(httpResponseBody.Name)
	state.Description = helper.HandleEmptyFieldString(httpResponseBody.Description)
	state.HostName = helper.HandleEmptyFieldString(httpResponseBody.Host)

	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *organizationResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	if r.deletionsDisabled {
		tflog.Warn(ctx, "Organizations cannot be deleted")
		resp.Diagnostics.AddWarning("Organizations cannot be deleted",
			"Foundry does not support deleted Organizations. Since deletions_disabled is set to true, the remote organization will not be deleted but the resource will be removed from state.")
		return
	}

	//return error here IMMEDIATELY, as Organizations are not allowed to be deleted
	tflog.Error(ctx, "Organizations cannot be deleted")
	resp.Diagnostics.AddError("Organizations cannot be deleted",
		"Foundry does not support deleted Organizations!")
}

// ImportState imports an existing organization into Terraform state.
func (r *organizationResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	// The import ID is expected to be the organization RID
	organizationRID := req.ID

	// Validate the ID format (optional, can add your own validation logic)
	if organizationRID == "" {
		resp.Diagnostics.AddError(
			"Invalid Import ID",
			"The import ID must be the organization RID",
		)
		return
	}

	tflog.Info(ctx, fmt.Sprintf("Importing organization with RID %s", organizationRID))

	// Set the organization RID in state
	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("rid"), organizationRID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the RID
}
