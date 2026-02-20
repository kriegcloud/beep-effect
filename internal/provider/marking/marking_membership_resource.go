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

package marking

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
	_ resource.Resource              = &markingMembershipResource{}
	_ resource.ResourceWithConfigure = &markingMembershipResource{}
)

// NewMarkingMembershipResource is a helper function to simplify provider implementation.
func NewMarkingMembershipResource() resource.Resource {
	return &markingMembershipResource{}
}

// markingMembershipResource is the resource implementation.
type markingMembershipResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider configured client to the resource.
func (r *markingMembershipResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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
func (r *markingMembershipResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_marking_membership"
}

// Schema defines the schema for the resource.
func (r *markingMembershipResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Marking's Membership.",
		Attributes: map[string]schema.Attribute{
			"marking_id": schema.StringAttribute{
				Description: "ID of the Marking.",
				Required:    true,
			},
			"marking_members": schema.SetAttribute{
				ElementType: types.StringType,
				Description: "List of the IDs of the members (Users or Groups) of this Marking.",
				Optional:    true,
			},
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *markingMembershipResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan markingMembershipResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		resp.Diagnostics.Append(diags...)
		return
	}

	if !plan.MarkingMembers.IsNull() {
		err := r.CreateMarkingMembers(ctx, resp, &plan)
		if err != nil {
			resp.Diagnostics.AddError("Error creating the Marking members. Please fix your plan if needed and re-apply.", err.Error())
		}
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *markingMembershipResource) CreateMarkingMembers(ctx context.Context, resp *resource.CreateResponse, plan *markingMembershipResourceModel) error {
	oldMarkingMembers, err := r.ReadMarkingMembersOnCreation(ctx, resp, plan)

	if err != nil {
		return err
	}

	var newMarkingMembers []string

	//only initialize if not null, otherwise ElementsAs will throw error instead of just handling as empty slice
	if !plan.MarkingMembers.IsNull() {
		diags := plan.MarkingMembers.ElementsAs(ctx, &newMarkingMembers, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert marking members to Go slice")
		}
	}

	if !slices.Equal(oldMarkingMembers, newMarkingMembers) {
		// Determine members to add or remove.
		membersToAdd, membersToRemove := helper.FindStringSliceDiff(oldMarkingMembers, newMarkingMembers)
		if len(membersToAdd) != 0 {
			err := r.AddMarkingMembers(ctx, membersToAdd, plan.MarkingId.ValueString())
			if err != nil {
				return err
			}
		}
		if len(membersToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveMarkingMembers(ctx, membersToRemove, plan.MarkingId.ValueString())
			if err != nil {
				return err
			}
		} else if len(membersToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found marking members in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, member-removal operations will not be applied.")
		}
	}
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *markingMembershipResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state markingMembershipResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadMarkingMembers(ctx, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Marking members", err.Error())
	}

	// Set refreshed state
	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *markingMembershipResource) ReadMarkingMembers(ctx context.Context, state *markingMembershipResourceModel) error {
	pageSize := constants.PageSize

	httpResp, err := r.client.AdminListMarkingMembers(ctx, state.MarkingId.ValueString(), &v2.AdminListMarkingMembersParams{PageSize: &pageSize})

	if err != nil {
		return fmt.Errorf("AdminListMarkingMembers request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from AdminListMarkingMembers response: %w", err)
		}
		return errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return fmt.Errorf("failed to parse response from AdminListMarkingMembers: %w", err)
	}

	var httpMarkingMembersResponseBody markingMembersResponseBody
	if err := json.Unmarshal(bodyBytes, &httpMarkingMembersResponseBody); err != nil {
		return fmt.Errorf("error decoding response: %w", err)
	}

	markingMemberIds := make([]string, 0)

	//var markingMemberIds []string
	for _, markingMember := range httpMarkingMembersResponseBody.Data {
		markingMemberIds = append(markingMemberIds, markingMember.PrincipalID)
	}

	state.MarkingMembers, _ = types.SetValueFrom(ctx, types.StringType, markingMemberIds)
	return nil
}

func (r *markingMembershipResource) ReadMarkingMembersOnCreation(ctx context.Context, resp *resource.CreateResponse, plan *markingMembershipResourceModel) ([]string, error) {
	pageSize := constants.PageSize

	httpResp, err := r.client.AdminListMarkingMembers(ctx, plan.MarkingId.ValueString(), &v2.AdminListMarkingMembersParams{PageSize: &pageSize})

	if err != nil {
		return nil, fmt.Errorf("AdminListMarkingMembers request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return nil, fmt.Errorf("failed to format error logging from AdminListMarkingMembers response: %w", err)
		}
		return nil, errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse response from AdminListMarkingMembers: %w", err)
	}

	var httpMarkingMembersResponseBody markingMembersResponseBody
	if err := json.Unmarshal(bodyBytes, &httpMarkingMembersResponseBody); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	markingMemberIds := make([]string, 0)

	//var markingMemberIds []string
	for _, markingMember := range httpMarkingMembersResponseBody.Data {
		markingMemberIds = append(markingMemberIds, markingMember.PrincipalID)
	}

	return markingMemberIds, nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *markingMembershipResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan markingMembershipResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state markingMembershipResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.UpdateMarkingMembers(ctx, &plan, &state, resp)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Marking members. Please fix your plan if needed and re-apply", err.Error())
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *markingMembershipResource) UpdateMarkingMembers(ctx context.Context, plan *markingMembershipResourceModel, state *markingMembershipResourceModel, resp *resource.UpdateResponse) error {
	var oldMarkingMembers []string
	var newMarkingMembers []string

	if !state.MarkingMembers.IsNull() {
		diags := state.MarkingMembers.ElementsAs(ctx, &oldMarkingMembers, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert marking members to Go slice")
		}
	}

	//only initialize if not null, otherwise ElementsAs will throw error instead of just handling as empty slice
	if !plan.MarkingMembers.IsNull() {
		diags := plan.MarkingMembers.ElementsAs(ctx, &newMarkingMembers, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert marking members to Go slice")
		}
	}

	if !slices.Equal(oldMarkingMembers, newMarkingMembers) {
		// Determine members to add or remove.
		membersToAdd, membersToRemove := helper.FindStringSliceDiff(oldMarkingMembers, newMarkingMembers)
		if len(membersToAdd) != 0 {
			err := r.AddMarkingMembers(ctx, membersToAdd, state.MarkingId.ValueString())
			if err != nil {
				return err
			}
		}
		if len(membersToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveMarkingMembers(ctx, membersToRemove, state.MarkingId.ValueString())
			if err != nil {
				return err
			}
		} else if len(membersToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found marking members in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, member-removal operations will not be applied.")
		}
		//if there was a change (and no error thrown), update state to equal plan
		state.MarkingMembers = plan.MarkingMembers
	}
	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *markingMembershipResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	// Retrieve values from state
	var state markingMembershipResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	resp.Diagnostics.AddWarning("Called Delete on a marking membership resource.",
		fmt.Sprintf("The membership resource for marking id %s will be removed from state, but no members will be removed remotely.", state.MarkingId.ValueString()))

}

// ImportState imports an existing marking into Terraform state.
func (r *markingMembershipResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	// The import ID is expected to be the marking ID
	markingID := req.ID

	// Validate the ID format (optional, can add your own validation logic)
	if markingID == "" {
		resp.Diagnostics.AddError(
			"Invalid Import ID",
			"The import ID must be the marking ID",
		)
		return
	}

	tflog.Info(ctx, fmt.Sprintf("Importing marking membership for marking with ID %s", markingID))

	// Set the Marking ID in state
	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("marking_id"), markingID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the RID
}

func (r *markingMembershipResource) AddMarkingMembers(ctx context.Context, membersToAdd []string, id string) error {
	uuidsToRemove, err := helper.ConvertStringsToUUIDs(membersToAdd)

	if err != nil {
		return fmt.Errorf("failed to convert members to add to UUIDs: %w", err)
	}

	//create body
	httpResp, err := r.client.AdminAddMarkingMembers(ctx, id, v2.AdminAddMarkingMembersJSONRequestBody{
		PrincipalIds: &uuidsToRemove,
	})

	if err != nil {
		return fmt.Errorf("AdminAddMarkingMembers request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from AdminAddMarkingMembers response: %w", err)
		}
		return errors.New(returnString)
	}

	return nil
}

func (r *markingMembershipResource) RemoveMarkingMembers(ctx context.Context, membersToRemove []string, id string) error {
	uuidsToRemove, err := helper.ConvertStringsToUUIDs(membersToRemove)

	if err != nil {
		return fmt.Errorf("failed to convert members to remove to UUIDs: %w", err)
	}

	//create body
	httpResp, err := r.client.AdminRemoveMarkingMembers(ctx, id, v2.AdminRemoveMarkingMembersRequest{
		PrincipalIds: &uuidsToRemove,
	})

	if err != nil {
		return fmt.Errorf("AdminRemoveMarkingMembers request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from AdminRemoveMarkingMembers response: %w", err)
		}
		return errors.New(returnString)
	}

	return nil
}
