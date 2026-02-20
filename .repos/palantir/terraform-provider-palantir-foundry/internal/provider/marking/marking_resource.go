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
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/hashicorp/terraform-plugin-framework-validators/stringvalidator"
	"github.com/hashicorp/terraform-plugin-framework/path"
	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema"
	"github.com/hashicorp/terraform-plugin-framework/schema/validator"
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
	_ resource.Resource              = &markingResource{}
	_ resource.ResourceWithConfigure = &markingResource{}
)

// NewMarkingResource is a helper function to simplify provider implementation.
func NewMarkingResource() resource.Resource {
	return &markingResource{}
}

// markingResource is the resource implementation.
type markingResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider data to the resource.
func (r *markingResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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
func (r *markingResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_marking"
}

// Schema defines the schema for the resource.
func (r *markingResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Marking.",
		Attributes: map[string]schema.Attribute{
			"id": schema.StringAttribute{
				Description: "ID of the Marking.",
				Computed:    true,
			},
			"name": schema.StringAttribute{
				Description: "Name of the Marking.",
				Required:    true,
			},
			"category_id": schema.StringAttribute{
				Description: "The ID of a Marking Category. For user-created Categories, this will be a UUID. Markings associated with Organizations are placed in a category with ID \"Organization\". This field is immutable after creation.",
				Required:    true,
			},
			"description": schema.StringAttribute{
				Description: "Description of the Marking.",
				Optional:    true,
			},
			"initial_role_assignments": schema.SetNestedAttribute{
				Description: "The initial set of Role Assignments to be applied when creating the Marking. " +
					"Any changes to this field after Marking creation will not be applied; " +
					"instead, use the marking_role_assignments resource to manage Role Assignments. " +
					"The following Roles can be assigned to a Marking: \n - ADMINISTER: The user can add and remove members from the Marking, update Marking Role Assignments, and change Marking metadata.\n - DECLASSIFY: The user can remove the Marking from resources in the platform and stop the propagation of the Marking during a transform.\n - USE: The user can apply the Marking to resources in the platform.",
				Optional: true,
				NestedObject: schema.NestedAttributeObject{
					Attributes: map[string]schema.Attribute{
						"role": schema.StringAttribute{
							Required: true,
							Validators: []validator.String{
								stringvalidator.OneOf("ADMINISTER", "DECLASSIFY", "USE"),
							},
						},
						"principal_id": schema.StringAttribute{
							Required: true,
						},
					},
				},
			},
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *markingResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	// Retrieve values from plan
	var plan markingResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		resp.Diagnostics.Append(diags...)
		return
	}

	err := r.CreateMarking(ctx, resp, &plan)
	if err != nil {
		resp.Diagnostics.AddError("Error creating the Marking. Please fix your plan if needed and re-apply", err.Error())
		return
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *markingResource) CreateMarking(ctx context.Context, resp *resource.CreateResponse, plan *markingResourceModel) error {

	previewMode := constants.PreviewMode
	adminCreateMarkingParams := v2.AdminCreateMarkingParams{Preview: &previewMode}
	description := plan.Description.ValueString()

	var initialRoleAssignments []markingRolesRequestBodyEntry
	diags := plan.InitialRoleAssignments.ElementsAs(context.Background(), &initialRoleAssignments, false)
	if diags.HasError() {
		resp.Diagnostics.Append(diags...)
		return fmt.Errorf("failed to convert roles to Go slice")
	}

	var initialRoleAssignmentsBody []v2.AdminMarkingRoleUpdate
	for _, item := range initialRoleAssignments {
		principalIDAsUUID, err := uuid.Parse(item.PrincipalID)

		if err != nil {
			return fmt.Errorf("invalid UUID format for principal ID %s: %w", item.PrincipalID, err)
		}

		initialRoleAssignmentsBody = append(initialRoleAssignmentsBody, v2.AdminMarkingRoleUpdate{
			Role:        v2.AdminMarkingRole(item.Role),
			PrincipalID: principalIDAsUUID,
		})
	}

	httpResp, err := r.client.AdminCreateMarking(ctx,
		&adminCreateMarkingParams,
		v2.AdminCreateMarkingJSONRequestBody{
			Name:                   plan.Name.ValueString(),
			CategoryID:             plan.CategoryID.ValueString(),
			Description:            &description,
			InitialRoleAssignments: &initialRoleAssignmentsBody,
		})

	if err != nil {
		resp.Diagnostics.AddError("AdminCreateMarking request failed", err.Error())
		return fmt.Errorf("AdminCreateMarking request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from AdminCreateMarking response", err.Error())
			return fmt.Errorf("failed to format error logging from AdminCreateMarking response: %w", err)
		}
		resp.Diagnostics.AddError("Response from AdminCreateMarking was unsuccessful: ", returnString)
		return fmt.Errorf("response from AdminCreateMarking was unsuccessful: %s", returnString)
	}

	//if success - take id from the response and update the state
	var httpResponseBody responseBody

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from AdminCreateMarking", err.Error())
		return fmt.Errorf("failed to parse response from AdminCreateMarking: %w", err)
	}
	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	//CREATE - do not save state if id is not saved
	if httpResponseBody.ID == "" {
		tflog.Error(ctx, "ID was not populated in response, "+
			"so Terraform best practice is NOT to update state as resource likely was not properly created")
		resp.Diagnostics.AddError("ID returned as empty",
			"ID was not populated in response, "+
				"so Terraform best practice is NOT to update state as resource likely was not properly created")
		return fmt.Errorf("ID returned as empty: %s", httpResponseBody.ID)
	}

	//Set computed values
	plan.ID = types.StringValue(httpResponseBody.ID)
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *markingResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state markingResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadMarking(ctx, resp, &state, state.ID.ValueString())
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Marking", err.Error())
		return
	}

	if resp.Diagnostics.Warnings().Contains(providerError.ResourceNotFoundWarning(state.ID.ValueString(), "Marking")) {
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

func (r *markingResource) ReadMarking(ctx context.Context, resp *resource.ReadResponse, state *markingResourceModel, markingId string) error {
	previewMode := constants.PreviewMode
	adminGetMarkingParams := v2.AdminGetMarkingParams{Preview: &previewMode}

	httpResp, err := r.client.AdminGetMarking(ctx, markingId, &adminGetMarkingParams)

	if err != nil {
		resp.Diagnostics.AddError("AdminGetMarking request failed", err.Error())
		return fmt.Errorf("AdminGetMarking request failed: %w", err)
	}
	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		if httpResp.StatusCode == http.StatusNotFound {
			resp.Diagnostics.Append(providerError.ResourceNotFoundWarning(state.ID.ValueString(), "Marking"))
			return nil
		}
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from AdminGetMarking response", err.Error())
			return fmt.Errorf("failed to format error logging from AdminGetMarking response: %w", err)
		}
		resp.Diagnostics.AddError("Response from AdminGetMarking was unsuccessful: ", returnString)
		return fmt.Errorf("response from AdminGetMarking was unsuccessful: %s", returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from AdminGetMarking", err.Error())
		return fmt.Errorf("failed to parse response from AdminGetMarking: %w", err)
	}

	//if success - take id from the response and update the state
	var httpResponseBody responseBody
	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	state.ID = types.StringValue(httpResponseBody.ID)
	state.CategoryID = types.StringValue(httpResponseBody.CategoryID)
	state.Name = types.StringValue(httpResponseBody.Name)
	state.Description = helper.HandleEmptyFieldString(httpResponseBody.Description)
	return nil
}

func (r *markingResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	var plan markingResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	var state markingResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	if !plan.InitialRoleAssignments.Equal(state.InitialRoleAssignments) {
		resp.Diagnostics.AddError("Initial Role Assignments cannot be updated after creation. Any changes will not be applied.",
			"Initial Role Assignments cannot be updated after creation. Any changes will not be applied.")
	}

	err := r.UpdateMarking(ctx, resp, &plan, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error updating marking. Please fix your plan if needed and re-apply", err.Error())
		return
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *markingResource) UpdateMarking(ctx context.Context, resp *resource.UpdateResponse, plan *markingResourceModel, state *markingResourceModel) error {
	if plan.CategoryID != state.CategoryID {
		return fmt.Errorf("you may not change the category ID of a marking once it has been created. Please revert your plan to the existing category ID and re-apply")
	}
	previewMode := constants.PreviewMode
	adminReplaceMarkingParams := v2.AdminReplaceMarkingParams{Preview: &previewMode}
	description := plan.Description.ValueString()

	httpResp, err := r.client.AdminReplaceMarking(ctx, state.ID.ValueString(), &adminReplaceMarkingParams, v2.AdminReplaceMarkingJSONRequestBody{
		Name:        plan.Name.ValueString(),
		Description: &description,
	})

	if err != nil {
		resp.Diagnostics.AddError("AdminReplaceMarking request failed", err.Error())
		return fmt.Errorf("AdminReplaceMarking request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			resp.Diagnostics.AddError("Failed to format error logging from AdminReplaceMarking response", err.Error())
			return fmt.Errorf("failed to format error logging from AdminReplaceMarking response: %w", err)
		}
		resp.Diagnostics.AddError("Response from AdminReplaceMarking was unsuccessful: ", returnString)
		return fmt.Errorf("response from AdminReplaceMarking was unsuccessful: %s", returnString)
	}

	//read body and then close
	var httpResponseBody responseBody

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		resp.Diagnostics.AddError("Failed to parse response from AdminReplaceMarking", err.Error())
		return fmt.Errorf("failed to parse response from AdminReplaceMarking: %w", err)
	}

	if err := json.Unmarshal(bodyBytes, &httpResponseBody); err != nil {
		resp.Diagnostics.AddError("Error decoding response",
			fmt.Sprintf("... details ... %s", err))
		return fmt.Errorf("error decoding response: %w", err)
	}

	// Update the state with the new values

	state.Name = types.StringValue(httpResponseBody.Name)
	state.Description = helper.HandleEmptyFieldString(httpResponseBody.Description)

	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *markingResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	if r.deletionsDisabled {
		resp.Diagnostics.AddWarning("Markings cannot be deleted",
			"Foundry does not support deleted markings. Since deletions_disabled is set to true, the remote markings will not be deleted, but this resource will be removed from state.")
		return
	}

	// error here IMMEDIATELY, as Markings are not allowed to be deleted
	tflog.Error(ctx, "Markings cannot be deleted")
	resp.Diagnostics.AddError("Markings cannot be deleted",
		"Foundry does not support deleted markings!")
}

// ImportState imports an existing marking into Terraform state.
func (r *markingResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	markingID := req.ID

	if markingID == "" {
		resp.Diagnostics.AddError(
			"Invalid Import ID",
			"The import ID must be the marking RID",
		)
		return
	}

	tflog.Info(ctx, fmt.Sprintf("Importing marking with ID %s", markingID))

	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("id"), markingID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the ID
}
