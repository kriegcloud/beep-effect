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

package enrollment

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
	_ resource.Resource              = &enrollmentResource{}
	_ resource.ResourceWithConfigure = &enrollmentResource{}
)

// NewEnrollmentResource is a helper function to simplify provider implementation.
func NewEnrollmentResource() resource.Resource {
	return &enrollmentResource{}
}

// enrollmentResource is the resource implementation.
type enrollmentResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

func (r *enrollmentResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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
func (r *enrollmentResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_enrollment"
}

// Schema defines the schema for the resource.
func (r *enrollmentResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Enrollment.",
		Attributes: map[string]schema.Attribute{
			"rid": schema.StringAttribute{
				Description: "RID of the Enrollment.",
				Computed:    true,
			},
			"enrollment_roles": schema.SetAttribute{
				Description: "List of role assignments for this Enrollment.",
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
func (r *enrollmentResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	// Retrieve values from plan
	tflog.Error(ctx, "Enrollments cannot be created")
	resp.Diagnostics.AddError("Enrollments cannot be created",
		"Foundry terraform provider currently does not support creating enrollments")
	return
}

// Read refreshes the Terraform state with the latest data.
func (r *enrollmentResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state enrollmentResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadEnrollmentRoles(ctx, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Enrollment roles", err.Error())
	}

	// Set refreshed state
	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *enrollmentResource) ReadEnrollmentRoles(ctx context.Context, state *enrollmentResourceModel) error {
	previewMode := constants.PreviewMode
	adminListEnrollmentRoleAssignmentsParams := v2.AdminListEnrollmentRoleAssignmentsParams{Preview: &previewMode}
	httpResp, err := r.client.AdminListEnrollmentRoleAssignments(ctx, state.RID.ValueString(), &adminListEnrollmentRoleAssignmentsParams)

	if err != nil {
		return fmt.Errorf("AdminListEnrollmentRoleAssignments request failed: %w", err)
	}
	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from AdminListEnrollmentRoleAssignments response: %w", err)
		}
		return errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return fmt.Errorf("failed to parse response from AdminListEnrollmentRoleAssignments: %w", err)
	}
	var httpEnrollmentRolesResponseBody enrollmentRolesResponseBody
	if err := json.Unmarshal(bodyBytes, &httpEnrollmentRolesResponseBody); err != nil {
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
	for _, entry := range httpEnrollmentRolesResponseBody.Data {
		roleAssignment, _ := types.ObjectValue(
			roleAssignmentType.AttrTypes,
			map[string]attr.Value{
				"principal_id": types.StringValue(entry.PrincipalID),
				"role_id":      types.StringValue(entry.RoleID),
			},
		)
		roleAssignments = append(roleAssignments, roleAssignment)
	}

	// Create the set from the list of objects
	state.EnrollmentRoles, _ = types.SetValueFrom(ctx, roleAssignmentType, roleAssignments)
	return nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *enrollmentResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan enrollmentResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state enrollmentResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.UpdateEnrollmentRoles(ctx, &plan, &state, resp)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Enrollment roles. Please fix your plan if needed and re-apply",
			err.Error())
	}

	// Set updated state
	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *enrollmentResource) UpdateEnrollmentRoles(ctx context.Context, plan *enrollmentResourceModel, state *enrollmentResourceModel, resp *resource.UpdateResponse) error {

	var oldEnrollmentRoles []enrollmentRolesRequestBodyEntry
	var newEnrollmentRoles []enrollmentRolesRequestBodyEntry

	diags := state.EnrollmentRoles.ElementsAs(ctx, &oldEnrollmentRoles, false)
	if diags.HasError() {
		return fmt.Errorf("failed to convert enrollment roles to Go slice")
	}

	diags = plan.EnrollmentRoles.ElementsAs(ctx, &newEnrollmentRoles, false)
	if diags.HasError() {
		return fmt.Errorf("failed to convert enrollment roles to Go slice")
	}

	hasAdmin := false
	for _, role := range newEnrollmentRoles {
		if role.RoleID == constants.EnrollmentAdministratorRoleID {
			hasAdmin = true
			break
		}
	}
	if !hasAdmin && !r.deletionsDisabled {
		return fmt.Errorf("the Enrollment must have at least one Administrator")
	}

	previewMode := constants.PreviewMode

	if !slices.Equal(oldEnrollmentRoles, newEnrollmentRoles) {
		// Determine members to add and remove
		rolesToAdd, rolesToRemove := findEnrollmentRolesDiff(oldEnrollmentRoles, newEnrollmentRoles)
		if len(rolesToAdd) != 0 {

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
			adminAddEnrollmentRoleAssignmentsParams := v2.AdminAddEnrollmentRoleAssignmentsParams{Preview: &previewMode}
			httpResp, err := r.client.AdminAddEnrollmentRoleAssignments(ctx, state.RID.ValueString(), &adminAddEnrollmentRoleAssignmentsParams, v2.AdminAddEnrollmentRoleAssignmentsJSONRequestBody{
				RoleAssignments: &roleUpdates,
			})

			if err != nil {
				return fmt.Errorf("AdminAddEnrollmentRoleAssignments request failed: %w", err)
			}

			// Check the response status code
			if httpResp.StatusCode != http.StatusNoContent {
				returnString, err := providerError.FormatHTTPError(httpResp)
				if err != nil {
					return fmt.Errorf("failed to format error logging from AdminAddEnrollmentRoleAssignments response: %w", err)
				}
				return errors.New(returnString)
			}
		}
		if len(rolesToRemove) != 0 && !r.deletionsDisabled {
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

			adminRemoveEnrollmentRoleAssignmentsParams := v2.AdminRemoveEnrollmentRoleAssignmentsParams{Preview: &previewMode}
			httpResp, err := r.client.AdminRemoveEnrollmentRoleAssignments(ctx, state.RID.ValueString(), &adminRemoveEnrollmentRoleAssignmentsParams, v2.AdminRemoveEnrollmentRoleAssignmentsJSONRequestBody{
				RoleAssignments: &roleUpdates,
			})

			if err != nil {
				return fmt.Errorf("AdminRemoveEnrollmentRoleAssignments request failed: %w", err)
			}

			// Check the response status code
			if httpResp.StatusCode != http.StatusNoContent {
				returnString, err := providerError.FormatHTTPError(httpResp)
				if err != nil {
					return fmt.Errorf("failed to format error logging from AdminRemoveEnrollmentRoleAssignments response: %w", err)
				}
				return errors.New(returnString)
			}
		} else if len(rolesToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found roles defined in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, role-removal operations will not be applied.")
		}
		//if there was a change (and no error thrown), update state to equal plan
		state.EnrollmentRoles = plan.EnrollmentRoles
	}
	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *enrollmentResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	if r.deletionsDisabled {
		tflog.Warn(ctx, "Enrollments cannot be deleted")
		resp.Diagnostics.AddWarning("Enrollments cannot be deleted",
			"Since deletions_disabled is set to true, the remote enrollment will not be deleted, but this resource will be removed from state.")
		return
	}

	tflog.Error(ctx, "Enrollments cannot be deleted")
	resp.Diagnostics.AddError("Enrollments cannot be deleted",
		"The Terraform provider does not currently support deleting Enrollments")
}

func (r *enrollmentResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	// The import ID is expected to be the organization RID
	enrollmentRID := req.ID

	// Validate the ID format (optional, can add your own validation logic)
	if enrollmentRID == "" {
		resp.Diagnostics.AddError(
			"Invalid Import ID",
			"The import ID must be the enrollment RID",
		)
		return
	}

	tflog.Info(ctx, fmt.Sprintf("Importing enrollment with RID %s", enrollmentRID))

	// Set the organization RID in state
	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("rid"), enrollmentRID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the RID
}

func findEnrollmentRolesDiff(oldSlice, newSlice []enrollmentRolesRequestBodyEntry) (added, removed []enrollmentRolesRequestBodyEntry) {
	// Create maps for quick lookup
	oldMap := make(map[string]enrollmentRolesRequestBodyEntry)
	newMap := make(map[string]enrollmentRolesRequestBodyEntry)

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
