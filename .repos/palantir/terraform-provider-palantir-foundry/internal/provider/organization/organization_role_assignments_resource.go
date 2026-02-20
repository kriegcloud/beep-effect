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
	"errors"
	"fmt"
	"net/http"
	"slices"

	"github.com/google/uuid"
	"github.com/hashicorp/terraform-plugin-framework/attr"
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
	_ resource.Resource              = &organizationRoleAssignmentsResource{}
	_ resource.ResourceWithConfigure = &organizationRoleAssignmentsResource{}
)

// NewOrganizationRoleAssignmentsResource is a helper function to simplify provider implementation.
func NewOrganizationRoleAssignmentsResource() resource.Resource {
	return &organizationRoleAssignmentsResource{}
}

// organizationRoleAssignmentsResource is the resource implementation.
type organizationRoleAssignmentsResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider configured client to the resource.
func (r *organizationRoleAssignmentsResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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
func (r *organizationRoleAssignmentsResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_organization_role_assignments"
}

// Schema defines the schema for the resource.
func (r *organizationRoleAssignmentsResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Organization's Role Assignments.",
		Attributes: map[string]schema.Attribute{
			"organization_rid": schema.StringAttribute{
				Description: "RID of the Organization.",
				Required:    true,
			},
			"organization_role_assignments": schema.SetAttribute{
				Description: "List of Role Assignments for this Organization.",
				Required:    true,
				ElementType: types.ObjectType{
					AttrTypes: map[string]attr.Type{
						"role_id":      types.StringType,
						"principal_id": types.StringType,
					},
				},
			},
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *organizationRoleAssignmentsResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan organizationRoleAssignmentsResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		resp.Diagnostics.Append(diags...)
		return
	}

	if !plan.OrganizationRoleAssignments.IsNull() {
		err := r.CreateOrganizationRoleAssignments(ctx, resp, &plan)
		if err != nil {
			resp.Diagnostics.AddError("Error creating the Organization Role Assignments. Please fix your plan if needed and re-apply.", err.Error())
		}
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *organizationRoleAssignmentsResource) CreateOrganizationRoleAssignments(ctx context.Context, resp *resource.CreateResponse, plan *organizationRoleAssignmentsResourceModel) error {
	var newRoleAssignments []organizationRolesRequestBodyEntry
	diags := plan.OrganizationRoleAssignments.ElementsAs(context.Background(), &newRoleAssignments, false)

	if diags.HasError() {
		return fmt.Errorf("failed to convert planned role_assignments to Go slice")
	}

	hasAdmin := false
	for _, role := range newRoleAssignments {
		if role.RoleID == constants.OrganizationAdministratorRoleID {
			hasAdmin = true
			break
		}
	}
	if !hasAdmin && !r.deletionsDisabled {
		return fmt.Errorf("the Organization must have at least one administrator")
	}

	oldRoleAssignments, err := r.ReadOrganizationRoleAssignmentsOnCreation(ctx, plan)

	if err != nil {
		return fmt.Errorf("failed to read organization orgs on creation: %w", err)
	}

	if !slices.Equal(oldRoleAssignments, newRoleAssignments) {
		// Determine orgs to add and remove
		rolesToAdd, rolesToRemove := findOrganizationRolesDiff(oldRoleAssignments, newRoleAssignments)
		if len(rolesToAdd) != 0 {
			err := r.AddOrganizationRoleAssignments(ctx, rolesToAdd, plan.OrganizationRID.ValueString())
			if err != nil {
				return err
			}
		}
		if len(rolesToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveOrganizationRoleAssignments(ctx, rolesToRemove, plan.OrganizationRID.ValueString())
			if err != nil {
				return err
			}
		} else if len(rolesToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found Role Assignments defined in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, Role Assignments removal operations will not be applied.")
		}
	}
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *organizationRoleAssignmentsResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state organizationRoleAssignmentsResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadOrganizationRoleAssignments(ctx, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Organization role_assignments", err.Error())
	}

	// Set refreshed state
	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *organizationRoleAssignmentsResource) ReadOrganizationRoleAssignments(ctx context.Context, state *organizationRoleAssignmentsResourceModel) error {
	previewMode := constants.PreviewMode
	adminOrganizationRoleAssignmentParams := v2.AdminListOrganizationRoleAssignmentsParams{Preview: &previewMode}
	httpResp, err := r.client.AdminListOrganizationRoleAssignments(ctx, state.OrganizationRID.ValueString(), &adminOrganizationRoleAssignmentParams)

	if err != nil {
		return fmt.Errorf("AdminListOrganizationRoleAssignments request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from AdminListOrganizationRoleAssignments response: %w", err)
		}
		return errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return fmt.Errorf("failed to parse response from AdminListOrganizationRoleAssignments: %w", err)
	}
	var httpOrganizationRolesResponseBody organizationRolesResponseBody
	if err := json.Unmarshal(bodyBytes, &httpOrganizationRolesResponseBody); err != nil {
		return fmt.Errorf("error decoding response: %w", err)
	}

	roleAssignmentType := types.ObjectType{
		AttrTypes: map[string]attr.Type{
			"principal_id": types.StringType,
			"role_id":      types.StringType,
		},
	}

	// Convert each entry to a map of attribute values
	roleAssignments := make([]attr.Value, 0)
	//var objects []attr.Value
	for _, entry := range httpOrganizationRolesResponseBody.Data {
		roleAssignment, _ := types.ObjectValue(
			roleAssignmentType.AttrTypes,
			map[string]attr.Value{
				"principal_id": types.StringValue(entry.PrincipalID),
				"role_id":      types.StringValue(entry.RoleID),
			},
		)
		roleAssignments = append(roleAssignments, roleAssignment)
	}

	state.OrganizationRoleAssignments, _ = types.SetValueFrom(ctx, roleAssignmentType, roleAssignments)
	return nil
}

func (r *organizationRoleAssignmentsResource) ReadOrganizationRoleAssignmentsOnCreation(ctx context.Context, plan *organizationRoleAssignmentsResourceModel) ([]organizationRolesRequestBodyEntry, error) {
	previewMode := constants.PreviewMode
	adminOrganizationRoleAssignmentParams := v2.AdminListOrganizationRoleAssignmentsParams{Preview: &previewMode}
	httpResp, err := r.client.AdminListOrganizationRoleAssignments(ctx, plan.OrganizationRID.ValueString(), &adminOrganizationRoleAssignmentParams)

	if err != nil {
		return nil, fmt.Errorf("AdminListOrganizationRoleAssignments request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return nil, fmt.Errorf("failed to format error logging from AdminListOrganizationRoleAssignments response: %w", err)
		}
		return nil, errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse response from AdminListOrganizationRoleAssignments: %w", err)
	}
	var httpOrganizationRolesResponseBody organizationRolesResponseBody
	if err := json.Unmarshal(bodyBytes, &httpOrganizationRolesResponseBody); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	rolesToReturn := make([]organizationRolesRequestBodyEntry, 0)

	//var objects []attr.Value
	for _, entry := range httpOrganizationRolesResponseBody.Data {
		roleAssignment := organizationRolesRequestBodyEntry{RoleID: entry.RoleID, PrincipalID: entry.PrincipalID}
		rolesToReturn = append(rolesToReturn, roleAssignment)
	}

	return rolesToReturn, nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *organizationRoleAssignmentsResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan organizationRoleAssignmentsResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state organizationRoleAssignmentsResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.UpdateOrganizationRoleAssignments(ctx, &plan, &state, resp)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Organization role_assignments. Please fix your plan if needed and re-apply", err.Error())
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *organizationRoleAssignmentsResource) UpdateOrganizationRoleAssignments(ctx context.Context, plan *organizationRoleAssignmentsResourceModel, state *organizationRoleAssignmentsResourceModel, resp *resource.UpdateResponse) error {
	var oldRoleAssignments []organizationRolesRequestBodyEntry
	var newRoleAssignments []organizationRolesRequestBodyEntry

	diags := state.OrganizationRoleAssignments.ElementsAs(ctx, &oldRoleAssignments, false)
	if diags.HasError() {
		return fmt.Errorf("failed to convert org roles to Go slice")
	}

	diags = plan.OrganizationRoleAssignments.ElementsAs(ctx, &newRoleAssignments, false)
	if diags.HasError() {
		return fmt.Errorf("failed to convert org roles to Go slice")
	}

	hasAdmin := false
	for _, role := range newRoleAssignments {
		if role.RoleID == constants.OrganizationAdministratorRoleID {
			hasAdmin = true
			break
		}
	}
	if !hasAdmin && !r.deletionsDisabled {
		return fmt.Errorf("the Organization must have at least one administrator")
	}

	if !slices.Equal(oldRoleAssignments, newRoleAssignments) {
		// Determine orgs to add and remove
		rolesToAdd, rolesToRemove := findOrganizationRolesDiff(oldRoleAssignments, newRoleAssignments)
		if len(rolesToAdd) != 0 {
			err := r.AddOrganizationRoleAssignments(ctx, rolesToAdd, plan.OrganizationRID.ValueString())
			if err != nil {
				return err
			}
		}
		if len(rolesToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveOrganizationRoleAssignments(ctx, rolesToRemove, plan.OrganizationRID.ValueString())
			if err != nil {
				return err
			}
		} else if len(rolesToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found Role Assignments defined in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, Role Assignments removal operations will not be applied.")
		}
		state.OrganizationRoleAssignments = plan.OrganizationRoleAssignments
	}
	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *organizationRoleAssignmentsResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	// Retrieve values from state
	var state organizationRoleAssignmentsResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	resp.Diagnostics.AddWarning("Called Delete on a organization role_assignments resource.",
		fmt.Sprintf("The role_assignments resource for organization rid %s will be removed from state, but no role assignments will be removed remotely.", state.OrganizationRID.ValueString()))

}

// ImportState imports existing organization role_assignments into Terraform state.
func (r *organizationRoleAssignmentsResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
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

	tflog.Info(ctx, fmt.Sprintf("Importing organization role_assignments for organization with ID %s", organizationRID))

	// Set the Organization RID in state
	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("organization_rid"), organizationRID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the RID
}

func (r *organizationRoleAssignmentsResource) AddOrganizationRoleAssignments(ctx context.Context, rolesToAdd []organizationRolesRequestBodyEntry, rid string) error {
	previewMode := constants.PreviewMode

	roleUpdates := make([]v2.CoreRoleAssignmentUpdate, len(rolesToAdd))
	for i, role := range rolesToAdd {

		principalIDAsUUID, err := uuid.Parse(role.PrincipalID)

		if err != nil {
			return fmt.Errorf("invalid UUID format for principal ID %s: %w", role.PrincipalID, err)
		}

		roleUpdates[i] = v2.CoreRoleAssignmentUpdate{
			RoleID:      role.RoleID,
			PrincipalID: principalIDAsUUID,
		}
	}

	adminAddOrganizationRoleAssignmentParams := v2.AdminAddOrganizationRoleAssignmentsParams{Preview: &previewMode}
	httpResp, err := r.client.AdminAddOrganizationRoleAssignments(ctx, rid, &adminAddOrganizationRoleAssignmentParams, v2.AdminAddOrganizationRoleAssignmentsJSONRequestBody{
		RoleAssignments: &roleUpdates,
	})

	if err != nil {
		return fmt.Errorf("AdminAddOrganizationRoleAssignments request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from AdminAddOrganizationRoleAssignments response: %w", err)
		}
		return errors.New(returnString)
	}

	return nil
}

func (r *organizationRoleAssignmentsResource) RemoveOrganizationRoleAssignments(ctx context.Context, rolesToRemove []organizationRolesRequestBodyEntry, rid string) error {
	previewMode := constants.PreviewMode

	roleUpdates := make([]v2.CoreRoleAssignmentUpdate, len(rolesToRemove))
	for i, role := range rolesToRemove {

		principalIDAsUUID, err := uuid.Parse(role.PrincipalID)

		if err != nil {
			return fmt.Errorf("invalid UUID format for principal ID %s: %w", role.PrincipalID, err)
		}

		roleUpdates[i] = v2.CoreRoleAssignmentUpdate{
			RoleID:      role.RoleID,
			PrincipalID: principalIDAsUUID,
		}
	}

	adminRemoveOrganizationRoleAssignmentsParams := v2.AdminRemoveOrganizationRoleAssignmentsParams{Preview: &previewMode}
	httpResp, err := r.client.AdminRemoveOrganizationRoleAssignments(ctx, rid, &adminRemoveOrganizationRoleAssignmentsParams, v2.AdminRemoveOrganizationRoleAssignmentsJSONRequestBody{
		RoleAssignments: &roleUpdates,
	})

	if err != nil {
		return fmt.Errorf("AdminRemoveOrganizationRoleAssignments request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from AdminRemoveOrganizationRoleAssignments response: %w", err)
		}
		return errors.New(returnString)
	}

	return nil
}

func findOrganizationRolesDiff(oldSlice, newSlice []organizationRolesRequestBodyEntry) (added, removed []organizationRolesRequestBodyEntry) {
	// Create maps for quick lookup
	oldMap := make(map[string]organizationRolesRequestBodyEntry)
	newMap := make(map[string]organizationRolesRequestBodyEntry)

	// Populate the maps with elements from the slices
	for _, item := range oldSlice {
		key := item.PrincipalID + "|" + item.RoleID
		oldMap[key] = item
	}
	for _, item := range newSlice {
		key := item.PrincipalID + "|" + item.RoleID
		newMap[key] = item
	}

	// Find added elements (in newSlice but not in oldSlice)
	for key, item := range newMap {
		if _, exists := oldMap[key]; !exists {
			added = append(added, item)
		}
	}

	// Find removed elements (in oldSlice but not in newSlice)
	for key, item := range oldMap {
		if _, exists := newMap[key]; !exists {
			removed = append(removed, item)
		}
	}

	return added, removed
}
