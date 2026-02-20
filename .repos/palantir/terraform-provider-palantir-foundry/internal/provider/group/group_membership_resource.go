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

package group

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"slices"

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
	_ resource.Resource              = &groupMembershipResource{}
	_ resource.ResourceWithConfigure = &groupMembershipResource{}
)

// NewGroupMembershipResource is a helper function to simplify provider implementation.
func NewGroupMembershipResource() resource.Resource {
	return &groupMembershipResource{}
}

// groupMembershipResource is the resource implementation.
type groupMembershipResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider configured client to the resource.
func (r *groupMembershipResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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
func (r *groupMembershipResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_group_membership"
}

// Schema defines the schema for the resource.
func (r *groupMembershipResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Group's Membership.",
		Attributes: map[string]schema.Attribute{
			"group_id": schema.StringAttribute{
				Description: "ID of the Group.",
				Required:    true,
			},
			"group_members": schema.SetAttribute{
				ElementType: types.StringType,
				Description: "List of the IDs of the members (Users or Groups) of this Group.",
				Optional:    true,
			},
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *groupMembershipResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan groupMembershipResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		resp.Diagnostics.Append(diags...)
		return
	}

	if !plan.GroupMembers.IsNull() {
		err := r.CreateGroupMembers(ctx, resp, &plan)
		if err != nil {
			resp.Diagnostics.AddError("Error creating the Group members. Please fix your plan if needed and re-apply.", err.Error())
		}
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *groupMembershipResource) CreateGroupMembers(ctx context.Context, resp *resource.CreateResponse, plan *groupMembershipResourceModel) error {
	oldGroupMembers, err := r.ReadGroupMembersOnCreation(ctx, resp, plan)

	if err != nil {
		return err
	}

	var newGroupMembers []string

	//only initialize if not null, otherwise ElementsAs will throw error instead of just handling as empty slice
	if !plan.GroupMembers.IsNull() {
		diags := plan.GroupMembers.ElementsAs(ctx, &newGroupMembers, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert group members to Go slice")
		}
	}

	groupIdAsUUID, err := uuid.Parse(plan.GroupId.ValueString())

	if err != nil {
		return fmt.Errorf("invalid UUID format for principal ID %s: %w", plan.GroupId.ValueString(), err)
	}

	if !slices.Equal(oldGroupMembers, newGroupMembers) {
		// Determine members to add or remove.
		membersToAdd, membersToRemove := helper.FindStringSliceDiff(oldGroupMembers, newGroupMembers)
		if len(membersToAdd) != 0 {

			uuidsToAdd, err := helper.ConvertStringsToUUIDs(membersToAdd)

			if err != nil {
				return fmt.Errorf("failed to convert members to add to UUIDs: %w", err)
			}

			//create body
			httpResp, err := r.client.AdminAddGroupMembers(ctx, groupIdAsUUID, v2.AdminAddGroupMembersJSONRequestBody{
				PrincipalIds: &uuidsToAdd,
			})

			if err != nil {
				return fmt.Errorf("AdminAddGroupMembers request failed: %w", err)
			}

			// Check the response status code
			if httpResp.StatusCode != http.StatusNoContent {
				returnString, err := providerError.FormatHTTPError(httpResp)
				if err != nil {
					return fmt.Errorf("failed to format error logging from AdminAddGroupMembers response: %w", err)
				}
				return errors.New(returnString)
			}
		}
		if len(membersToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveGroupMembers(ctx, membersToRemove, groupIdAsUUID)
			if err != nil {
				return err
			}
		} else if len(membersToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found group members in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, member-removal operations will not be applied.")
		}
	}
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *groupMembershipResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state groupMembershipResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadGroupMembers(ctx, resp, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Group members", err.Error())
	}

	// Set refreshed state
	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *groupMembershipResource) ReadGroupMembers(ctx context.Context, resp *resource.ReadResponse, state *groupMembershipResourceModel) error {
	pageSize := constants.PageSize

	groupIdAsUUID, err := uuid.Parse(state.GroupId.ValueString())

	if err != nil {
		return fmt.Errorf("invalid UUID format for principal ID %s: %w", state.GroupId.ValueString(), err)
	}

	httpResp, err := r.client.AdminListGroupMembers(ctx, groupIdAsUUID, &v2.AdminListGroupMembersParams{PageSize: &pageSize})

	if err != nil {
		return fmt.Errorf("AdminListGroupMembers request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from AdminListGroupMembers response: %w", err)
		}
		return errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return fmt.Errorf("failed to parse response from AdminListGroupMembers: %w", err)
	}

	var httpGroupMembersResponseBody groupMembersResponseBody
	if err := json.Unmarshal(bodyBytes, &httpGroupMembersResponseBody); err != nil {
		return fmt.Errorf("error decoding response: %w", err)
	}

	groupMemberIds := make([]string, 0)

	//var groupMemberIds []string
	for _, groupMember := range httpGroupMembersResponseBody.Data {
		groupMemberIds = append(groupMemberIds, groupMember.PrincipalID)
	}

	state.GroupMembers, _ = types.SetValueFrom(ctx, types.StringType, groupMemberIds)
	return nil
}

func (r *groupMembershipResource) ReadGroupMembersOnCreation(ctx context.Context, resp *resource.CreateResponse, plan *groupMembershipResourceModel) ([]string, error) {
	pageSize := constants.PageSize

	groupIdAsUUID, err := uuid.Parse(plan.GroupId.ValueString())

	if err != nil {
		return nil, fmt.Errorf("invalid UUID format for principal ID %s: %w", plan.GroupId.ValueString(), err)
	}

	httpResp, err := r.client.AdminListGroupMembers(ctx, groupIdAsUUID, &v2.AdminListGroupMembersParams{PageSize: &pageSize})

	if err != nil {
		return nil, fmt.Errorf("AdminListGroupMembers request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return nil, fmt.Errorf("failed to format error logging from AdminListGroupMembers response: %w", err)
		}
		return nil, errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse response from AdminListGroupMembers: %w", err)
	}

	var httpGroupMembersResponseBody groupMembersResponseBody
	if err := json.Unmarshal(bodyBytes, &httpGroupMembersResponseBody); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	groupMemberIds := make([]string, 0)

	//var groupMemberIds []string
	for _, groupMember := range httpGroupMembersResponseBody.Data {
		groupMemberIds = append(groupMemberIds, groupMember.PrincipalID)
	}

	return groupMemberIds, nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *groupMembershipResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan groupMembershipResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state groupMembershipResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.UpdateGroupMembers(ctx, &plan, &state, resp)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Group members. Please fix your plan if needed and re-apply", err.Error())
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *groupMembershipResource) UpdateGroupMembers(ctx context.Context, plan *groupMembershipResourceModel, state *groupMembershipResourceModel, resp *resource.UpdateResponse) error {
	var oldGroupMembers []string
	var newGroupMembers []string

	if !state.GroupMembers.IsNull() {
		diags := state.GroupMembers.ElementsAs(ctx, &oldGroupMembers, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert group members to Go slice")
		}
	}

	//only initialize if not null, otherwise ElementsAs will throw error instead of just handling as empty slice
	if !plan.GroupMembers.IsNull() {
		diags := plan.GroupMembers.ElementsAs(ctx, &newGroupMembers, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert group members to Go slice")
		}
	}

	groupIdAsUUID, err := uuid.Parse(state.GroupId.ValueString())

	if err != nil {
		return fmt.Errorf("invalid UUID format for principal ID %s: %w", state.GroupId.ValueString(), err)
	}

	if !slices.Equal(oldGroupMembers, newGroupMembers) {
		// Determine members to add or remove.
		membersToAdd, membersToRemove := helper.FindStringSliceDiff(oldGroupMembers, newGroupMembers)
		if len(membersToAdd) != 0 {
			uuidsToAdd, err := helper.ConvertStringsToUUIDs(membersToAdd)

			if err != nil {
				return fmt.Errorf("failed to convert members to add to UUIDs: %w", err)
			}

			//create body
			httpResp, err := r.client.AdminAddGroupMembers(ctx, groupIdAsUUID, v2.AdminAddGroupMembersJSONRequestBody{
				PrincipalIds: &uuidsToAdd,
			})

			if err != nil {
				return fmt.Errorf("AdminAddGroupMembers request failed: %w", err)
			}

			// Check the response status code
			if httpResp.StatusCode != http.StatusNoContent {
				returnString, err := providerError.FormatHTTPError(httpResp)
				if err != nil {
					return fmt.Errorf("failed to format error logging from AdminAddGroupMembers response: %w", err)
				}
				return errors.New(returnString)
			}
		}
		if len(membersToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveGroupMembers(ctx, membersToRemove, groupIdAsUUID)
			if err != nil {
				return err
			}
		} else if len(membersToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found group members in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, member-removal operations will not be applied.")
		}
		//if there was a change (and no error thrown), update state to equal plan
		state.GroupMembers = plan.GroupMembers
	}
	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *groupMembershipResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	// Retrieve values from state
	var state groupMembershipResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	resp.Diagnostics.AddWarning("Called Delete on a group membership resource.",
		fmt.Sprintf("The membership resource for group id %s will be removed from state, but no members will be removed remotely.", state.GroupId.ValueString()))

}

// ImportState imports an existing group into Terraform state.
func (r *groupMembershipResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	// The import ID is expected to be the group ID
	groupID := req.ID

	// Validate the ID format (optional, can add your own validation logic)
	if groupID == "" {
		resp.Diagnostics.AddError(
			"Invalid Import ID",
			"The import ID must be the group ID",
		)
		return
	}

	tflog.Info(ctx, fmt.Sprintf("Importing group membership for group with ID %s", groupID))

	// Set the Group ID in state
	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("group_id"), groupID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the RID
}

func (r *groupMembershipResource) RemoveGroupMembers(ctx context.Context, membersToRemove []string, id uuid.UUID) error {
	uuidsToRemove, err := helper.ConvertStringsToUUIDs(membersToRemove)

	if err != nil {
		return fmt.Errorf("failed to convert members to add to UUIDs: %w", err)
	}

	//create body
	httpResp, err := r.client.AdminRemoveGroupMembers(ctx, id, v2.AdminRemoveGroupMembersRequest{
		PrincipalIds: &uuidsToRemove,
	})

	if err != nil {
		return fmt.Errorf("AdminRemoveGroupMembers request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from AdminRemoveGroupMembers response: %w", err)
		}
		return errors.New(returnString)
	}

	return nil
}
