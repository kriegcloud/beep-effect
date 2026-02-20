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

package project

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
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
	_ resource.Resource              = &projectResource{}
	_ resource.ResourceWithConfigure = &projectResource{}
)

// NewProjectResource is a helper function to simplify provider implementation.
func NewProjectResource() resource.Resource {
	return &projectResource{}
}

// projectResource is the resource implementation.
type projectResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider data to the resource.
func (r *projectResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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
func (r *projectResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_project"
}

// Schema defines the schema for the resource.
func (r *projectResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Project.",
		Attributes: map[string]schema.Attribute{
			"rid": schema.StringAttribute{
				Description: "RID of the Project.",
				Computed:    true,
			},
			"display_name": schema.StringAttribute{
				Description: "Display name of the Project.",
				Required:    true,
			},
			"space_rid": schema.StringAttribute{
				Description: "RID of the Space that this Project belongs to.",
				Required:    true,
			},
			"description": schema.StringAttribute{
				Description: "Description of the Project.",
				Optional:    true,
			},
			"trash_status": schema.StringAttribute{
				Description: "Current trash status of the Project.",
				Computed:    true,
			},
			"initial_resource_roles": schema.SetNestedAttribute{
				Description: "The initial set of Roles to be applied when creating the Project. " +
					"Any changes to this field after Project creation will not be applied; " +
					"instead, use the project_resource_roles resource to manage Roles.",
				Optional: true,
				NestedObject: schema.NestedAttributeObject{
					Attributes: map[string]schema.Attribute{
						"resource_role_principal": schema.SingleNestedAttribute{
							Required: true,
							Attributes: map[string]schema.Attribute{
								"type": schema.StringAttribute{
									Required: true,
								},
								"principal_id": schema.StringAttribute{
									Optional:    true,
									Description: "The ID of a Foundry Group or User.",
								},
								"principal_type": schema.StringAttribute{
									Optional:    true,
									Description: "Enum values: USER, GROUP.",
								},
							},
						},
						"role_id": schema.StringAttribute{
							Required:    true,
							Description: "The unique ID for a Role.",
						},
					},
				},
			},
			"initial_organizations": schema.SetAttribute{
				Description: "The initial list of Organizations to be applied when creating the Project. " +
					"Any changes to this field after Project creation will not be applied; " +
					"instead, use the project_organizations resource to manage Organizations.",
				Optional:    true,
				ElementType: types.StringType,
			},
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *projectResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	// Retrieve values from plan
	var plan projectResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.CreateProject(ctx, resp, &plan)
	if err != nil {
		resp.Diagnostics.AddError("Error creating the Project. Please fix your plan if needed and re-apply", err.Error())
		return
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectResource) CreateProject(ctx context.Context, resp *resource.CreateResponse, plan *projectResourceModel) error {

	previewMode := constants.PreviewMode
	filesystemCreateProjectParams := v2.FilesystemCreateProjectParams{Preview: &previewMode}
	description := plan.Description.ValueString()

	resourceRoles := make(map[string][]v2.FilesystemPrincipalWithID)
	defaultRoles := make([]v2.CoreRoleID, 0)

	var initialResourceRoles []ResourceRole

	diags := plan.InitialResourceRoles.ElementsAs(ctx, &initialResourceRoles, false)
	if diags.HasError() {
		return fmt.Errorf("failed to convert initial resource roles to Go map")
	}

	// Unmarshal the map into a generic map

	// Iterate through each role grant
	for _, roleGrant := range initialResourceRoles {

		//if type = everyone, pass into default roles
		if roleGrant.ResourceRolePrincipal.Type == constants.Everyone {
			defaultRoles = append(defaultRoles, roleGrant.RoleID)
		}
		if roleGrant.ResourceRolePrincipal.Type == constants.PrincipalWithID {
			if roleGrant.ResourceRolePrincipal.PrincipalID == nil {
				return fmt.Errorf("principal ID must be provided for principal type %s", constants.PrincipalWithID)
			}
			if roleGrant.ResourceRolePrincipal.PrincipalType == nil {
				return fmt.Errorf("principal type must be provided for principal type %s", constants.PrincipalWithID)
			}
			principalIDAsUUID, err := uuid.Parse(*roleGrant.ResourceRolePrincipal.PrincipalID)

			if err != nil {
				return fmt.Errorf("invalid UUID format for principal ID %s: %w", principalIDAsUUID, err)
			}

			principal := v2.FilesystemPrincipalWithID{
				PrincipalID:   principalIDAsUUID,
				PrincipalType: v2.CorePrincipalType(*roleGrant.ResourceRolePrincipal.PrincipalType),
				Type:          roleGrant.ResourceRolePrincipal.Type,
			}
			resourceRoles[roleGrant.RoleID] = append(resourceRoles[roleGrant.RoleID], principal)
		}
	}

	var organizations []string
	diags = plan.InitialOrganizations.ElementsAs(ctx, &organizations, false)

	if diags.HasError() {
		resp.Diagnostics.Append(diags...)
		return fmt.Errorf("failed to convert organizations to Go slice")
	}

	httpResp, err := r.client.FilesystemCreateProject(ctx,
		&filesystemCreateProjectParams,
		v2.FilesystemCreateProjectJSONRequestBody{
			Description:      &description,
			DisplayName:      plan.DisplayName.ValueString(),
			SpaceRid:         plan.SpaceRID.ValueString(),
			RoleGrants:       &resourceRoles,
			DefaultRoles:     &defaultRoles,
			OrganizationRids: &organizations,
		})

	tflog.Debug(ctx, fmt.Sprintf("FilesystemCreateProject response: %+v", httpResp))

	if err != nil {
		resp.Diagnostics.AddError("FilesystemCreateProject request failed", err.Error())
		return fmt.Errorf("FilesystemCreateProject request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from FilesystemCreateProject response", err.Error())
			return fmt.Errorf("failed to format error logging from FilesystemCreateProject response: %w", err)
		}
		resp.Diagnostics.AddError("Response from FilesystemCreateProject was unsuccessful: ", returnString)
		return fmt.Errorf("response from FilesystemCreateProject was unsuccessful: %s", returnString)
	}

	//if success - take id from the response and update the state
	var httpResponseBody responseBody

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from FilesystemCreateProject", err.Error())
		return fmt.Errorf("failed to parse response from FilesystemCreateProject: %w", err)
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
	plan.TrashStatus = types.StringValue(httpResponseBody.TrashStatus)
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *projectResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state projectResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadProject(ctx, resp, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Project.", err.Error())
		return
	}

	if resp.Diagnostics.Warnings().Contains(providerError.ResourceNotFoundWarning(state.RID.ValueString(), "Project")) {
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

func (r *projectResource) ReadProject(ctx context.Context, resp *resource.ReadResponse, state *projectResourceModel) error {
	httpResp, err := r.client.FilesystemGetProject(ctx, state.RID.ValueString())

	if err != nil {
		resp.Diagnostics.AddError("FilesystemGetProject request failed", err.Error())
		return fmt.Errorf("FilesystemGetProject request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		if httpResp.StatusCode == http.StatusNotFound {
			resp.Diagnostics.Append(providerError.ResourceNotFoundWarning(state.RID.ValueString(), "Project"))
			return nil
		}
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from FilesystemGetProject response", err.Error())
			return fmt.Errorf("failed to format error logging from FilesystemGetProject response: %w", err)
		}
		resp.Diagnostics.AddError("Response from FilesystemGetProject was unsuccessful: ", returnString)
		return fmt.Errorf("response from FilesystemGetProject was unsuccessful: %s", returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from FilesystemGetProject", err.Error())
		return fmt.Errorf("failed to parse response from FilesystemGetProject: %w", err)
	}

	//if success - take id from the response and update the state
	var httpResponseBody responseBody
	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	state.RID = types.StringValue(httpResponseBody.RID)
	state.SpaceRID = types.StringValue(httpResponseBody.SpaceRID)
	state.DisplayName = types.StringValue(httpResponseBody.DisplayName)
	state.Description = helper.HandleEmptyFieldString(httpResponseBody.Description)
	state.TrashStatus = types.StringValue(httpResponseBody.TrashStatus)
	return nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *projectResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan projectResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state projectResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	//three cases for errors here. We should throw an error here, as if we let the provider continue, it will throw an error due to discrepancy between plan (which has changed value) and state (which has not)
	if !plan.InitialResourceRoles.Equal(state.InitialResourceRoles) {
		resp.Diagnostics.AddError("Initial Roles cannot be updated after creation. Any changes will not be applied.",
			"Initial Roles cannot be updated after creation. Any changes will not be applied.")
	}

	if !plan.InitialOrganizations.Equal(state.InitialOrganizations) {
		resp.Diagnostics.AddError("Initial Organizations cannot be updated after creation. Any changes will not be applied.",
			"Initial Organizations cannot be updated after creation. Any changes will not be applied.")
	}

	err := r.UpdateProject(ctx, resp, &plan, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Project. Please fix your plan if needed and re-apply", err.Error())
		return
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectResource) UpdateProject(ctx context.Context, resp *resource.UpdateResponse, plan *projectResourceModel, state *projectResourceModel) error {
	previewMode := constants.PreviewMode

	filesystemReplaceProjectParams := v2.FilesystemReplaceProjectParams{Preview: &previewMode}
	description := plan.Description.ValueString()

	httpResp, err := r.client.FilesystemReplaceProject(ctx, state.RID.ValueString(), &filesystemReplaceProjectParams, v2.FilesystemReplaceProjectJSONRequestBody{
		DisplayName: plan.DisplayName.ValueString(),
		Description: &description,
	})

	if err != nil {
		resp.Diagnostics.AddError("FilesystemReplaceProject request failed", err.Error())
		return fmt.Errorf("FilesystemReplaceProject request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from FilesystemReplaceProject response", err.Error())
			return fmt.Errorf("failed to format error logging from FilesystemReplaceProject response: %w", err)
		}
		resp.Diagnostics.AddError("Response from FilesystemReplaceProject was unsuccessful: ", returnString)
		return fmt.Errorf("response from FilesystemReplaceProject was unsuccessful: %s", returnString)
	}

	//read body and then close
	var httpResponseBody responseBody

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from FilesystemReplaceProject", err.Error())
		return fmt.Errorf("failed to parse response from FilesystemReplaceProject: %w", err)
	}

	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	// Update the state with the new values

	state.DisplayName = types.StringValue(httpResponseBody.DisplayName)
	state.Description = helper.HandleEmptyFieldString(httpResponseBody.Description)

	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *projectResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	var state projectResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// If deletions are disabled, do not delete the remote project but remove the resource from state.
	if r.deletionsDisabled {
		resp.Diagnostics.AddWarning("Tried to perform a deletion when the deletions_disabled flag was set to true.",
			fmt.Sprintf("Remote project with name %s and rid %s will not be deleted, but this resource will be removed from state.", state.DisplayName.ValueString(), state.RID.ValueString()))
		return
	}

	if state.TrashStatus.ValueString() == string(v2.NOTTRASHED) {
		err := r.DeleteResource(ctx, resp, &state)
		if err != nil {
			resp.Diagnostics.AddError("Error deleting the Project", err.Error())
			return
		}
	}

	//if initial delete is successful, now we can check and permanently delete the resource.
	//this should also work for if the resource was already trashed directly or by ancestor outside of TF
	// and we are just permanently deleting it now. we should return if this fails
	if state.TrashStatus.ValueString() == string(v2.DIRECTLYTRASHED) || state.TrashStatus.ValueString() == string(v2.ANCESTORTRASHED) {
		err := r.PermanentlyDeleteResource(ctx, resp, &state)
		if err != nil {
			resp.Diagnostics.AddError("Error permanently deleting the project resource", err.Error())
		}
		// we want to return here as we do not want to destroy the resource if the permanent delete fails. since trash_status is a
		// computed value, we do not need to worry in case it doesn't get persisted in state now as it will on the next read of the resource
		return
	}
}

func (r *projectResource) DeleteResource(ctx context.Context, resp *resource.DeleteResponse, state *projectResourceModel) error {
	previewMode := constants.PreviewMode
	filesystemDeleteResourceParams := v2.FilesystemDeleteResourceParams{Preview: &previewMode}
	httpResp, err := r.client.FilesystemDeleteResource(ctx, state.RID.ValueString(), &filesystemDeleteResourceParams)

	if err != nil {
		resp.Diagnostics.AddError("FilesystemDeleteResource request failed", err.Error())
		return fmt.Errorf("FilesystemDeleteResource request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from FilesystemDeleteResource response", err.Error())
			return fmt.Errorf("failed to format error logging from FilesystemDeleteResource response: %w", err)
		}
		resp.Diagnostics.AddError("Response from FilesystemDeleteResource was unsuccessful: ", returnString)
		return fmt.Errorf("response from FilesystemDeleteResource was unsuccessful: %s", returnString)
	}
	state.TrashStatus = types.StringValue(string(v2.DIRECTLYTRASHED))
	return nil
}

func (r *projectResource) PermanentlyDeleteResource(ctx context.Context, resp *resource.DeleteResponse, state *projectResourceModel) error {
	previewMode := constants.PreviewMode
	filesystemPermanentlyDeleteResourceParams := v2.FilesystemPermanentlyDeleteResourceParams{Preview: &previewMode}
	httpResp, err := r.client.FilesystemPermanentlyDeleteResource(ctx, state.RID.ValueString(), &filesystemPermanentlyDeleteResourceParams)

	if err != nil {
		resp.Diagnostics.AddError("FilesystemPermanentlyDeleteResource request failed", err.Error())
		return fmt.Errorf("FilesystemPermanentlyDeleteResource request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from FilesystemPermanentlyDeleteResource response", err.Error())
			return fmt.Errorf("failed to format error logging from FilesystemPermanentlyDeleteResource response: %w", err)
		}
		resp.Diagnostics.AddError("Response from FilesystemPermanentlyDeleteResource was unsuccessful: ", returnString)
		return fmt.Errorf("response from FilesystemPermanentlyDeleteResource was unsuccessful: %s", returnString)
	}
	return nil
}

// ImportState imports an existing marking into Terraform state.
func (r *projectResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	// The import ID is expected to be the marking RID
	projectID := req.ID

	// Validate the ID format (optional, can add your own validation logic)
	if projectID == "" {
		resp.Diagnostics.AddError(
			"Invalid Import ID",
			"The import ID must be the project RID",
		)
		return
	}

	tflog.Info(ctx, fmt.Sprintf("Importing project with RID %s", projectID))

	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("rid"), projectID)...)
}
