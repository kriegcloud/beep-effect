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
	_ resource.Resource              = &projectMarkingsResource{}
	_ resource.ResourceWithConfigure = &projectMarkingsResource{}
)

// NewProjectMarkingsResource is a helper function to simplify provider implementation.
func NewProjectMarkingsResource() resource.Resource {
	return &projectMarkingsResource{}
}

// projectMarkingsResource is the resource implementation.
type projectMarkingsResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider configured client to the resource.
func (r *projectMarkingsResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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
func (r *projectMarkingsResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_project_markings"
}

// Schema defines the schema for the resource.
func (r *projectMarkingsResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Project's Markings.",
		Attributes: map[string]schema.Attribute{
			"project_rid": schema.StringAttribute{
				Description: "RID of the Project.",
				Required:    true,
			},
			"project_markings": schema.SetAttribute{
				ElementType: types.StringType,
				Description: "List of the IDs of the Markings directly applied to this Project.",
				Optional:    true,
			},
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *projectMarkingsResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan projectMarkingsResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		resp.Diagnostics.Append(diags...)
		return
	}

	if !plan.ProjectMarkings.IsNull() {
		err := r.CreateProjectMarkings(ctx, resp, &plan)
		if err != nil {
			resp.Diagnostics.AddError("Error creating the Project markings. Please fix your plan if needed and re-apply.", err.Error())
		}
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectMarkingsResource) CreateProjectMarkings(ctx context.Context, resp *resource.CreateResponse, plan *projectMarkingsResourceModel) error {
	var newMarkings []string
	diags := plan.ProjectMarkings.ElementsAs(context.Background(), &newMarkings, false)

	if diags.HasError() {
		return fmt.Errorf("failed to convert planned markings to Go slice")
	}

	oldMarkings, err := r.ReadProjectMarkingsOnCreation(ctx, plan)

	if err != nil {
		return fmt.Errorf("failed to read project markings on creation: %w", err)
	}

	if !slices.Equal(oldMarkings, newMarkings) {
		// Determine members to add and remove
		markingsToAdd, markingsToRemove := helper.FindStringSliceDiff(oldMarkings, newMarkings)
		if len(markingsToAdd) != 0 {
			err := r.AddProjectMarkings(ctx, markingsToAdd, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		}
		if len(markingsToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveProjectMarkings(ctx, markingsToRemove, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		} else if len(markingsToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found markings defined in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, marking-removal operations will not be applied.")
		}
	}
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *projectMarkingsResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state projectMarkingsResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadProjectMarkings(ctx, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Project markings", err.Error())
	}

	// Set refreshed state
	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectMarkingsResource) ReadProjectMarkings(ctx context.Context, state *projectMarkingsResourceModel) error {
	previewMode := constants.PreviewMode
	pageSize := constants.PageSize
	filesystemListMarkingsOfResourceParams := v2.FilesystemListMarkingsOfResourceParams{Preview: &previewMode, PageSize: &pageSize}
	httpResp, err := r.client.FilesystemListMarkingsOfResource(ctx, state.ProjectRid.ValueString(), &filesystemListMarkingsOfResourceParams)

	if err != nil {
		return fmt.Errorf("FilesystemListMarkingsOfResource request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from FilesystemListMarkingsOfResource response: %w", err)
		}
		return errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return fmt.Errorf("failed to parse response from FilesystemListResourceRoles: %w", err)
	}

	var httpListMarkingsResponseBody listMarkingsResponseBody
	if err := json.Unmarshal(bodyBytes, &httpListMarkingsResponseBody); err != nil {
		return fmt.Errorf("error decoding response: %w", err)

	}

	state.ProjectMarkings, _ = types.SetValueFrom(ctx, types.StringType, httpListMarkingsResponseBody.Data)
	return nil
}

func (r *projectMarkingsResource) ReadProjectMarkingsOnCreation(ctx context.Context, plan *projectMarkingsResourceModel) ([]string, error) {
	previewMode := constants.PreviewMode
	pageSize := constants.PageSize
	filesystemListMarkingsOfResourceParams := v2.FilesystemListMarkingsOfResourceParams{Preview: &previewMode, PageSize: &pageSize}
	httpResp, err := r.client.FilesystemListMarkingsOfResource(ctx, plan.ProjectRid.ValueString(), &filesystemListMarkingsOfResourceParams)

	if err != nil {
		return nil, fmt.Errorf("FilesystemListMarkingsOfResource request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return nil, fmt.Errorf("failed to format error logging from FilesystemListMarkingsOfResource response: %w", err)
		}
		return nil, errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse response from FilesystemListResourceRoles: %w", err)
	}

	var httpListMarkingsResponseBody listMarkingsResponseBody
	if err := json.Unmarshal(bodyBytes, &httpListMarkingsResponseBody); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	projectMarkingIds := make([]string, 0)

	for _, projectMarking := range httpListMarkingsResponseBody.Data {
		projectMarkingIds = append(projectMarkingIds, projectMarking)
	}

	return projectMarkingIds, nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *projectMarkingsResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan projectMarkingsResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state projectMarkingsResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.UpdateProjectMarkings(ctx, &plan, &state, resp)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Project markings. Please fix your plan if needed and re-apply", err.Error())
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectMarkingsResource) UpdateProjectMarkings(ctx context.Context, plan *projectMarkingsResourceModel, state *projectMarkingsResourceModel, resp *resource.UpdateResponse) error {
	var oldMarkings []string
	var newMarkings []string

	if !state.ProjectMarkings.IsNull() {
		diags := state.ProjectMarkings.ElementsAs(ctx, &oldMarkings, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert project markings to Go slice")
		}
	}

	if !plan.ProjectMarkings.IsNull() {
		diags := plan.ProjectMarkings.ElementsAs(ctx, &newMarkings, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert project markings to Go slice")
		}
	}

	if !slices.Equal(oldMarkings, newMarkings) {
		// Determine members to add and remove
		markingsToAdd, markingsToRemove := helper.FindStringSliceDiff(oldMarkings, newMarkings)
		if len(markingsToAdd) != 0 {
			err := r.AddProjectMarkings(ctx, markingsToAdd, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		}
		if len(markingsToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveProjectMarkings(ctx, markingsToRemove, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		} else if len(markingsToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found markings defined in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, marking-removal operations will not be applied.")
		}
		state.ProjectMarkings = plan.ProjectMarkings
	}
	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *projectMarkingsResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	// Retrieve values from state
	var state projectMarkingsResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	resp.Diagnostics.AddWarning("Called Delete on a project markings resource.",
		fmt.Sprintf("The markings resource for project rid %s will be removed from state, but no markings will be removed remotely.", state.ProjectRid.ValueString()))

}

// ImportState imports existing project markings into Terraform state.
func (r *projectMarkingsResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
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

	tflog.Info(ctx, fmt.Sprintf("Importing project markings for project with ID %s", projectRID))

	// Set the Project RID in state
	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("project_rid"), projectRID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the RID
}

func (r *projectMarkingsResource) AddProjectMarkings(ctx context.Context, markingsToAdd []string, id string) error {
	markingIdsToAdd := make([]v2.CoreMarkingID, len(markingsToAdd))
	for i, markingID := range markingsToAdd {
		markingIdsToAdd[i] = markingID
	}

	previewMode := constants.PreviewMode
	filesystemAddMarkingParams := v2.FilesystemAddMarkingsParams{Preview: &previewMode}
	httpResp, err := r.client.FilesystemAddMarkings(ctx, id, &filesystemAddMarkingParams, v2.FilesystemAddMarkingsJSONRequestBody{
		MarkingIds: &markingIdsToAdd,
	})

	if err != nil {
		return fmt.Errorf("FilesystemAddMarkings request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from FilesystemAddMarkings response: %w", err)
		}
		return errors.New(returnString)
	}

	return nil
}

func (r *projectMarkingsResource) RemoveProjectMarkings(ctx context.Context, markingsToRemove []string, id string) error {
	markingIdsToRemove := make([]v2.CoreMarkingID, len(markingsToRemove))
	for i, markingID := range markingsToRemove {
		markingIdsToRemove[i] = markingID
	}

	previewMode := constants.PreviewMode
	filesystemRemoveMarkingParams := v2.FilesystemRemoveMarkingsParams{Preview: &previewMode}
	httpResp, err := r.client.FilesystemRemoveMarkings(ctx, id, &filesystemRemoveMarkingParams, v2.FilesystemRemoveMarkingsJSONRequestBody{
		MarkingIds: &markingIdsToRemove,
	})

	if err != nil {
		return fmt.Errorf("FilesystemRemoveMarkings request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from FilesystemRemoveMarkings response: %w", err)
		}
		return errors.New(returnString)
	}

	return nil
}
