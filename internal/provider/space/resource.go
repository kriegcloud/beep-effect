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

package space

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
	_ resource.Resource              = &spaceResource{}
	_ resource.ResourceWithConfigure = &spaceResource{}
)

// NewSpaceResource is a helper function to simplify provider implementation.
func NewSpaceResource() resource.Resource {
	return &spaceResource{}
}

// spaceResource is the resource implementation.
type spaceResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider data to the resource.
func (r *spaceResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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
func (r *spaceResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_space"
}

// Schema defines the schema for the resource.
func (r *spaceResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Space.",
		Attributes: map[string]schema.Attribute{
			"rid": schema.StringAttribute{
				Description: "RID of the Space.",
				Computed:    true,
			},
			"enrollment_rid": schema.StringAttribute{
				Description: "RID of the Enrollment that this Space belongs to. This field required if the resource is created within Terraform, but not if created outside of Terraform and imported.",
				Optional:    true,
			},
			"display_name": schema.StringAttribute{
				Description: "Display name of the Space.",
				Required:    true,
			},
			"description": schema.StringAttribute{
				Description: "Description of the Space.",
				Optional:    true,
			},
			"path": schema.StringAttribute{
				Description: "Path of the Space.",
				Computed:    true,
			},
			"filesystem_id": schema.StringAttribute{
				Description: "The ID of the Filesystem for this Space, which is where the contents of the Space are stored. If not provided, the default Filesystem for this Enrollment will be used.",
				Computed:    true,
				Optional:    true,
			},
			"usage_account_rid": schema.StringAttribute{
				Description: "The RID of the Usage Account for this Space. Resource usage for projects in this space will accrue to this Usage Account by default. If not provided, the default Usage Account for this Enrollment will be used.",
				Computed:    true,
				Optional:    true,
			},
			"organizations": schema.SetAttribute{
				ElementType: types.StringType,
				Description: "List of the RIDs of the Organizations that are provisioned access to this Space. In order to access this Space, a user must be a member of at least one of these Organizations.",
				Required:    true,
			},
			"deletion_policy_organizations": schema.SetAttribute{
				ElementType: types.StringType,
				Description: "By default, this Space will use a Last Out deletion policy, meaning that this Space and its projects will be deleted when the last Organization listed here is deleted.",
				Required:    true,
			},
			"default_role_set_id": schema.StringAttribute{
				Description: "The ID of the default Role Set for this Space, which defines the set of roles that Projects in this Space must use. If not provided, the default Role Set for Projects will be used.",
				Computed:    true,
				Optional:    true,
			},
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *spaceResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan spaceResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		resp.Diagnostics.Append(diags...)
		return
	}

	err := r.CreateSpace(ctx, resp, &plan)
	if err != nil {
		resp.Diagnostics.AddError("Error creating the Space. Please fix your plan if needed and re-apply.", err.Error())
		return
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *spaceResource) CreateSpace(ctx context.Context, resp *resource.CreateResponse, plan *spaceResourceModel) error {

	previewMode := constants.PreviewMode
	filesystemCreateSpaceParams := v2.FilesystemCreateSpaceParams{Preview: &previewMode}

	var organizationsGoSlice []v2.CoreOrganizationRid
	diags := plan.Organizations.ElementsAs(ctx, &organizationsGoSlice, false)
	if diags.HasError() {
		resp.Diagnostics.Append(diags...)
		return fmt.Errorf("error converting fields from Go to Terraform")
	}

	var deletionPolicyOrganizationsGoSlice []v2.CoreOrganizationRid
	diags = plan.DeletionPolicyOrganizations.ElementsAs(ctx, &deletionPolicyOrganizationsGoSlice, false)
	if diags.HasError() {
		resp.Diagnostics.Append(diags...)
		return fmt.Errorf("error converting fields from Go to Terraform")
	}

	description := plan.Description.ValueString()
	var filesystemID *string
	if !plan.FilesystemID.IsUnknown() {
		filesystemID = plan.FilesystemID.ValueStringPointer()
	}
	var usageAccountRID *string
	if !plan.UsageAccountRID.IsUnknown() {
		usageAccountRID = plan.UsageAccountRID.ValueStringPointer()
	}
	var defaultRoleSetID *string
	if !plan.DefaultRoleSetID.IsUnknown() {
		defaultRoleSetID = plan.DefaultRoleSetID.ValueStringPointer()
	}

	requestBody := v2.FilesystemCreateSpaceJSONRequestBody{
		DisplayName:                 plan.DisplayName.ValueString(),
		EnrollmentRid:               plan.EnrollmentRID.ValueString(),
		Description:                 &description,
		FileSystemID:                filesystemID,
		UsageAccountRid:             usageAccountRID,
		Organizations:               &organizationsGoSlice,
		DeletionPolicyOrganizations: &deletionPolicyOrganizationsGoSlice,
		DefaultRoleSetID:            defaultRoleSetID,
	}
	jsonBytes, _ := json.Marshal(requestBody)

	tflog.Info(ctx, string(jsonBytes))

	httpResp, err := r.client.FilesystemCreateSpace(ctx, &filesystemCreateSpaceParams, requestBody)

	if err != nil {
		resp.Diagnostics.AddError("FilesystemCreateSpace request failed", err.Error())
		return fmt.Errorf("FilesystemCreateSpace request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from FilesystemCreateSpace response", err.Error())
			return fmt.Errorf("failed to format error logging from FilesystemCreateSpace response: %w", err)
		}
		resp.Diagnostics.AddError("Response from FilesystemCreateSpace was unsuccessful: ", returnString)
		return fmt.Errorf("response from FilesystemCreateSpace was unsuccessful: %s", returnString)
	}

	//read body and then close
	var httpResponseBody responseBody

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from FilesystemCreateSpace", err.Error())
		return fmt.Errorf("failed to parse response from FilesystemCreateSpace: %w", err)
	}

	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	//CREATE - do not save state if id is not saved
	if httpResponseBody.RID == "" {
		resp.Diagnostics.AddError("RID returned as empty",
			"ID was not populated in response, "+
				"so Terraform best practice is NOT to update state as resource likely was not properly created")
		return fmt.Errorf("ID returned as empty: %s", httpResponseBody.RID)
	}

	//update state for computed values
	plan.RID = types.StringValue(httpResponseBody.RID)
	plan.Path = types.StringValue(httpResponseBody.Path)
	plan.FilesystemID = types.StringValue(httpResponseBody.FilesystemID)
	plan.UsageAccountRID = types.StringValue(httpResponseBody.UsageAccountRID)
	plan.DefaultRoleSetID = types.StringValue(httpResponseBody.DefaultRoleSetID)
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *spaceResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state spaceResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadSpace(ctx, resp, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Space", err.Error())
		return
	}

	if resp.Diagnostics.Warnings().Contains(providerError.ResourceNotFoundWarning(state.RID.ValueString(), "Space")) {
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

func (r *spaceResource) ReadSpace(ctx context.Context, resp *resource.ReadResponse, state *spaceResourceModel) error {
	previewMode := constants.PreviewMode
	filesystemGetSpaceParams := v2.FilesystemGetSpaceParams{Preview: &previewMode}
	httpResp, err := r.client.FilesystemGetSpace(ctx, state.RID.ValueString(), &filesystemGetSpaceParams)

	if err != nil {
		resp.Diagnostics.AddError("FilesystemGetSpace request failed", err.Error())
		return fmt.Errorf("FilesystemGetSpace request failed: %w", err)
	}
	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		if httpResp.StatusCode == http.StatusNotFound {
			resp.Diagnostics.Append(providerError.ResourceNotFoundWarning(state.RID.ValueString(), "Space"))
			return nil
		}
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from FilesystemGetSpace response", err.Error())
			return fmt.Errorf("failed to format error logging from FilesystemGetSpace response: %w", err)
		}
		resp.Diagnostics.AddError("Response from FilesystemGetSpace was unsuccessful: ", returnString)
		return fmt.Errorf("response from AdminGFilesystemGetSpaceetGroup was unsuccessful: %s", returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from FilesystemGetSpace", err.Error())
		return fmt.Errorf("failed to parse response from FilesystemGetSpace: %w", err)
	}

	var httpResponseBody responseBody
	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	//if success - take id from the response and update the state

	state.RID = types.StringValue(httpResponseBody.RID)
	state.DisplayName = types.StringValue(httpResponseBody.DisplayName)
	state.Path = types.StringValue(httpResponseBody.Path)
	state.Description = helper.HandleEmptyFieldString(httpResponseBody.Description)
	state.FilesystemID = types.StringValue(httpResponseBody.FilesystemID)
	state.UsageAccountRID = types.StringValue(httpResponseBody.UsageAccountRID)
	state.Organizations, _ = types.SetValueFrom(ctx, types.StringType, httpResponseBody.Organizations)
	state.DefaultRoleSetID = types.StringValue(httpResponseBody.DefaultRoleSetID)
	state.DeletionPolicyOrganizations, _ = types.SetValueFrom(ctx, types.StringType, httpResponseBody.DeletionPolicyOrganizations)
	return nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *spaceResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan spaceResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state spaceResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.UpdateSpace(ctx, resp, &plan, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Space members. Please fix your plan if needed and re-apply", err.Error())
		return
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

}

func (r *spaceResource) UpdateSpace(ctx context.Context, resp *resource.UpdateResponse, plan *spaceResourceModel, state *spaceResourceModel) error {
	previewMode := constants.PreviewMode

	filesystemReplaceSpaceParams := v2.FilesystemReplaceSpaceParams{Preview: &previewMode}

	httpResp, err := r.client.FilesystemReplaceSpace(ctx, state.RID.ValueString(), &filesystemReplaceSpaceParams, v2.FilesystemReplaceSpaceJSONRequestBody{
		DisplayName:      plan.DisplayName.ValueString(),
		Description:      plan.Description.ValueStringPointer(),
		UsageAccountRid:  plan.UsageAccountRID.ValueStringPointer(),
		DefaultRoleSetID: plan.DefaultRoleSetID.ValueStringPointer(),
	})

	if err != nil {
		resp.Diagnostics.AddError("FilesystemReplaceSpace request failed", err.Error())
		return fmt.Errorf("FilesystemReplaceSpace request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from FilesystemReplaceSpace response", err.Error())
			return fmt.Errorf("failed to format error logging from FilesystemReplaceSpace response: %w", err)
		}
		resp.Diagnostics.AddError("Response from FilesystemReplaceSpace was unsuccessful: ", returnString)
		return fmt.Errorf("response from FilesystemReplaceSpace was unsuccessful: %s", returnString)
	}

	//read body and then close
	var httpResponseBody responseBody

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from FilesystemReplaceSpace", err.Error())
		return fmt.Errorf("failed to parse response from FilesystemReplaceSpace: %w", err)
	}

	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	// Update the state with the new values

	state.DisplayName = types.StringValue(httpResponseBody.DisplayName)
	state.Description = helper.HandleEmptyFieldString(httpResponseBody.Description)
	state.UsageAccountRID = types.StringValue(httpResponseBody.UsageAccountRID)
	state.DefaultRoleSetID = types.StringValue(httpResponseBody.DefaultRoleSetID)
	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *spaceResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	// Retrieve values from state
	var state spaceResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// If deletions are disabled, do not delete the remote space but remove the resource from state.
	if r.deletionsDisabled {
		resp.Diagnostics.AddWarning("Tried to perform a deletion when the deletions_disabled flag was set to true.",
			fmt.Sprintf("Remote space with name %s and rid %s will not be deleted, but this resource be will be removed from state.", state.DisplayName.ValueString(), state.RID.ValueString()))
		return
	}

	previewMode := constants.PreviewMode
	filesystemDeleteSpaceParams := v2.FilesystemDeleteSpaceParams{Preview: &previewMode}

	httpResp, err := r.client.FilesystemDeleteSpace(ctx, state.RID.ValueString(), &filesystemDeleteSpaceParams)

	if err != nil {
		resp.Diagnostics.AddError("FilesystemDeleteSpace request failed", err.Error())
		return
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("failed to format error logging from FilesystemDeleteSpace response", err.Error())
		}
		resp.Diagnostics.AddError("FilesystemDeleteSpace request failed", returnString)
		return
	}
}

// ImportState imports an existing group into Terraform state.
func (r *spaceResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	// The import ID is expected to be the group ID
	spaceRID := req.ID

	// Validate the ID format (optional, can add your own validation logic)
	if spaceRID == "" {
		resp.Diagnostics.AddError(
			"Invalid Import ID",
			"The import ID must be the group ID",
		)
		return
	}

	tflog.Info(ctx, fmt.Sprintf("Importing space with RID %s", spaceRID))

	// Set the organization RID in state
	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("rid"), spaceRID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the RID
}
