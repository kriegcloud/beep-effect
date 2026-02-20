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
	"errors"
	"fmt"
	"log"
	"net/http"
	"slices"

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
	_ resource.Resource              = &projectOrganizationsResource{}
	_ resource.ResourceWithConfigure = &projectOrganizationsResource{}
)

// NewProjectOrganizationsResource is a helper function to simplify provider implementation.
func NewProjectOrganizationsResource() resource.Resource {
	return &projectOrganizationsResource{}
}

// projectOrganizationsResource is the resource implementation.
type projectOrganizationsResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider configured client to the resource.
func (r *projectOrganizationsResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
	if req.ProviderData == nil {
		return
	}

	providerData, ok := req.ProviderData.(*shared.FoundryProviderData)

	if !ok {
		resp.Diagnostics.AddError(
			"Unexpected Resource Configure Type",
			fmt.Sprintf("Expected v2.ClientWithResponses, got: %T. Please report this issue to the provider developers.", req.ProviderData),
		)

		return
	}

	r.client = providerData.Client
	r.deletionsDisabled = providerData.Flags.DeletionsDisabled
}

// Metadata returns the resource type name.
func (r *projectOrganizationsResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_project_organizations"
}

// Schema defines the schema for the resource.
func (r *projectOrganizationsResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Project's Organizations.",
		Attributes: map[string]schema.Attribute{
			"project_rid": schema.StringAttribute{
				Description: "RID of the Project.",
				Required:    true,
			},
			"project_organizations": schema.SetAttribute{
				ElementType: types.StringType,
				Description: "List of the RIDs of the Organizations directly applied to this Project.",
				Optional:    true,
			},
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *projectOrganizationsResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan projectOrganizationsResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		resp.Diagnostics.Append(diags...)
		return
	}

	if !plan.ProjectOrganizations.IsNull() {
		err := r.CreateProjectOrganizations(ctx, resp, &plan)
		if err != nil {
			resp.Diagnostics.AddError("Error creating the Project Organizations. Please fix your plan if needed and re-apply.", err.Error())
		}
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectOrganizationsResource) CreateProjectOrganizations(ctx context.Context, resp *resource.CreateResponse, plan *projectOrganizationsResourceModel) error {
	var newOrganizations []string
	diags := plan.ProjectOrganizations.ElementsAs(context.Background(), &newOrganizations, false)

	if diags.HasError() {
		return fmt.Errorf("failed to convert planned organizations to Go slice")
	}

	oldOrganizations, err := r.ReadProjectOrganizationsOnCreation(ctx, plan)

	if err != nil {
		return fmt.Errorf("failed to read project orgs on creation: %w", err)
	}

	if !slices.Equal(oldOrganizations, newOrganizations) {
		// Determine orgs to add and remove
		organizationsToAdd, organizationsToRemove := helper.FindStringSliceDiff(oldOrganizations, newOrganizations)
		if len(organizationsToAdd) != 0 {
			err := r.AddProjectOrganizations(ctx, organizationsToAdd, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		}
		if len(organizationsToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveProjectOrganizations(ctx, organizationsToRemove, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		} else if len(organizationsToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found organizations defined in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, organizations-removal operations will not be applied.")
		}
	}
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *projectOrganizationsResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state projectOrganizationsResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadProjectOrganizations(ctx, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Project organizations", err.Error())
	}

	// Set refreshed state
	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectOrganizationsResource) ReadProjectOrganizations(ctx context.Context, state *projectOrganizationsResourceModel) error {
	previewMode := constants.PreviewMode
	pageSize := constants.PageSize
	filesystemListOrganizationsOfProjectParams := v2.FilesystemListOrganizationsOfProjectParams{Preview: &previewMode, PageSize: &pageSize}
	httpResp, err := r.client.FilesystemListOrganizationsOfProject(ctx, state.ProjectRid.ValueString(), &filesystemListOrganizationsOfProjectParams)

	if err != nil {
		log.Fatal(err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from FilesystemListOrganizationsOfProject response: %w", err)
		}
		return errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return fmt.Errorf("failed to parse response from FilesystemListOrganizationsOfProject: %w", err)
	}

	var httpListOrganizationsResponseBody listOrganizationsResponseBody
	if err := json.Unmarshal(bodyBytes, &httpListOrganizationsResponseBody); err != nil {
		return fmt.Errorf("error decoding response: %w", err)
	}

	state.ProjectOrganizations, _ = types.SetValueFrom(ctx, types.StringType, httpListOrganizationsResponseBody.Data)
	return nil
}

func (r *projectOrganizationsResource) ReadProjectOrganizationsOnCreation(ctx context.Context, plan *projectOrganizationsResourceModel) ([]string, error) {
	previewMode := constants.PreviewMode
	pageSize := constants.PageSize
	filesystemListOrganizationsOfProjectParams := v2.FilesystemListOrganizationsOfProjectParams{Preview: &previewMode, PageSize: &pageSize}
	httpResp, err := r.client.FilesystemListOrganizationsOfProject(ctx, plan.ProjectRid.ValueString(), &filesystemListOrganizationsOfProjectParams)

	if err != nil {
		return nil, fmt.Errorf("FilesystemListOrganizationsOfProject request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return nil, fmt.Errorf("failed to format error logging from FilesystemListOrganizationsOfProject response: %w", err)
		}
		return nil, errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse response from FilesystemListOrganizationsOfProject: %w", err)
	}

	var httpListOrganizationsResponseBody listOrganizationsResponseBody
	if err := json.Unmarshal(bodyBytes, &httpListOrganizationsResponseBody); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	projectOrganizationRids := make([]string, 0)

	for _, projectOrganization := range httpListOrganizationsResponseBody.Data {
		projectOrganizationRids = append(projectOrganizationRids, projectOrganization)
	}

	return projectOrganizationRids, nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *projectOrganizationsResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan projectOrganizationsResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state projectOrganizationsResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.UpdateProjectOrganizations(ctx, &plan, &state, resp)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Project organizations. Please fix your plan if needed and re-apply", err.Error())
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectOrganizationsResource) UpdateProjectOrganizations(ctx context.Context, plan *projectOrganizationsResourceModel, state *projectOrganizationsResourceModel, resp *resource.UpdateResponse) error {
	var oldOrganizations []string
	var newOrganizations []string

	diags := state.ProjectOrganizations.ElementsAs(ctx, &oldOrganizations, false)
	if diags.HasError() {
		return fmt.Errorf("failed to convert organizations to Go slice")
	}
	diags = plan.ProjectOrganizations.ElementsAs(ctx, &newOrganizations, false)
	if diags.HasError() {
		return fmt.Errorf("failed to convert organizations to Go slice")
	}

	if !slices.Equal(oldOrganizations, newOrganizations) {
		// Determine members to add and remove
		organizationsToAdd, organizationsToRemove := helper.FindStringSliceDiff(oldOrganizations, newOrganizations)
		if len(organizationsToAdd) != 0 {
			err := r.AddProjectOrganizations(ctx, organizationsToAdd, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		}
		if len(organizationsToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveProjectOrganizations(ctx, organizationsToRemove, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		} else if len(organizationsToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found organization members defined in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, organization-member-removal operations will not be applied.")
		}
		state.ProjectOrganizations = plan.ProjectOrganizations
	}
	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *projectOrganizationsResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	// Retrieve values from state
	var state projectOrganizationsResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	resp.Diagnostics.AddWarning("Called Delete on a project organizations resource.",
		fmt.Sprintf("The organizations resource for project rid %s will be removed from state, but no organizations will be removed remotely.", state.ProjectRid.ValueString()))

}

// ImportState imports existing project organizations into Terraform state.
func (r *projectOrganizationsResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	// The import ID is expected to be the project RID
	projectRID := req.ID

	// Validate the ID format (optional, can add your own validation logic)
	if projectRID == "" {
		resp.Diagnostics.AddError(
			"Invalid Import ID",
			"The import ID must be the project RID",
		)
		return
	}

	tflog.Info(ctx, fmt.Sprintf("Importing project organizations for project with ID %s", projectRID))

	// Set the Project RID in state
	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("project_rid"), projectRID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the RID
}

func (r *projectOrganizationsResource) AddProjectOrganizations(ctx context.Context, organizationRidsToAdd []string, id string) error {
	previewMode := constants.PreviewMode
	filesystemAddOrganizationsParams := v2.FilesystemAddOrganizationsParams{Preview: &previewMode}
	httpResp, err := r.client.FilesystemAddOrganizations(ctx, id, &filesystemAddOrganizationsParams, v2.FilesystemAddOrganizationsJSONRequestBody{
		OrganizationRids: &organizationRidsToAdd,
	})

	if err != nil {
		return fmt.Errorf("FilesystemAddOrganizations request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from FilesystemAddOrganizations response: %w", err)
		}
		return errors.New(returnString)
	}

	return nil
}

func (r *projectOrganizationsResource) RemoveProjectOrganizations(ctx context.Context, organizationRidsToRemove []string, id string) error {
	previewMode := constants.PreviewMode
	filesystemRemoveOrganizationsParams := v2.FilesystemRemoveOrganizationsParams{Preview: &previewMode}
	httpResp, err := r.client.FilesystemRemoveOrganizations(ctx, id, &filesystemRemoveOrganizationsParams, v2.FilesystemRemoveOrganizationsJSONRequestBody{
		OrganizationRids: &organizationRidsToRemove,
	})

	if err != nil {
		return fmt.Errorf("FilesystemRemoveOrganizations request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from FilesystemRemoveOrganizations response: %w", err)
		}
		return errors.New(returnString)
	}

	return nil
}
