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
	_ resource.Resource              = &projectResourceRolesResource{}
	_ resource.ResourceWithConfigure = &projectResourceRolesResource{}
)

// NewProjectResourceRolesResource is a helper function to simplify provider implementation.
func NewProjectResourceRolesResource() resource.Resource {
	return &projectResourceRolesResource{}
}

// projectResourceRolesResource is the resource implementation.
type projectResourceRolesResource struct {
	client            *v2.ClientWithResponses
	deletionsDisabled bool
}

// Configure adds the provider configured client to the resource.
func (r *projectResourceRolesResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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
func (r *projectResourceRolesResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_project_resource_roles"
}

// Schema defines the schema for the resource.
func (r *projectResourceRolesResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a Foundry Project's Resource Roles.",
		Attributes: map[string]schema.Attribute{
			"project_rid": schema.StringAttribute{
				Description: "RID of the Project.",
				Required:    true,
			},
			"project_resource_roles": schema.SetNestedAttribute{
				Description: "Set of Roles applied to this Project.",
				Optional:    true,
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
		},
	}
}

// Create creates a new resource and sets the initial Terraform state.
func (r *projectResourceRolesResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan projectResourceRolesResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		resp.Diagnostics.Append(diags...)
		return
	}

	if !plan.ProjectResourceRoles.IsNull() {
		err := r.CreateProjectResourceRoles(ctx, resp, &plan)
		if err != nil {
			resp.Diagnostics.AddError("Error creating the Project Resource Roles. Please fix your plan if needed and re-apply.", err.Error())
		}
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectResourceRolesResource) CreateProjectResourceRoles(ctx context.Context, resp *resource.CreateResponse, plan *projectResourceRolesResourceModel) error {
	var newResourceRoles []ResourceRole
	diags := plan.ProjectResourceRoles.ElementsAs(context.Background(), &newResourceRoles, false)

	if diags.HasError() {
		return fmt.Errorf("failed to convert planned resource_roles to Go slice")
	}

	oldResourceRoles, err := r.ReadProjectResourceRolesOnCreation(ctx, plan)

	if err != nil {
		return fmt.Errorf("failed to read project orgs on creation: %w", err)
	}

	if !slices.Equal(oldResourceRoles, newResourceRoles) {
		// Determine orgs to add and remove
		rolesToAdd, rolesToRemove := DiffResourceRoles(oldResourceRoles, newResourceRoles)
		if len(rolesToAdd) != 0 {
			err := r.AddProjectResourceRoles(ctx, rolesToAdd, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		}
		if len(rolesToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveProjectResourceRoles(ctx, rolesToRemove, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		} else if len(rolesToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found Resource Roles defined in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, Resource Roles removal operations will not be applied.")
		}
	}
	return nil
}

// Read refreshes the Terraform state with the latest data.
func (r *projectResourceRolesResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// Get current state
	var state projectResourceRolesResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.ReadProjectResourceRoles(ctx, &state)
	if err != nil {
		resp.Diagnostics.AddError("Error reading the Project resource_roles", err.Error())
	}

	// Set refreshed state
	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectResourceRolesResource) ReadProjectResourceRoles(ctx context.Context, state *projectResourceRolesResourceModel) error {
	pageSize := constants.PageSize
	filesystemListResourceRolesParams := v2.FilesystemListResourceRolesParams{PageSize: &pageSize}
	httpResp, err := r.client.FilesystemListResourceRoles(ctx, state.ProjectRid.ValueString(), &filesystemListResourceRolesParams)

	if err != nil {
		return fmt.Errorf("FilesystemListResourceRoles request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return fmt.Errorf("failed to format error logging from FilesystemListResourceRoles response: %w", err)
		}
		return errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return fmt.Errorf("failed to parse response from FilesystemListResourceRoles: %w", err)
	}

	var httpListResourceRoles ResourceRolesResponse
	if err := json.Unmarshal(bodyBytes, &httpListResourceRoles); err != nil {
		return fmt.Errorf("error decoding response: %w", err)
	}
	// Build a slice of attr.Value for the set
	var resourceRolesValues []attr.Value
	for _, role := range httpListResourceRoles.Roles {
		// Build the inner object
		principalObj, _ := types.ObjectValue(
			map[string]attr.Type{
				"type":           types.StringType,
				"principal_id":   types.StringType,
				"principal_type": types.StringType,
			},
			map[string]attr.Value{
				"type":           types.StringValue(role.ResourceRolePrincipal.Type),
				"principal_id":   types.StringValue(role.ResourceRolePrincipal.PrincipalID),
				"principal_type": types.StringValue(role.ResourceRolePrincipal.PrincipalType),
			},
		)

		// Build the outer object
		roleObj, _ := types.ObjectValue(
			map[string]attr.Type{
				"resource_role_principal": types.ObjectType{
					AttrTypes: map[string]attr.Type{
						"type":           types.StringType,
						"principal_id":   types.StringType,
						"principal_type": types.StringType,
					},
				},
				"role_id": types.StringType,
			},
			map[string]attr.Value{
				"resource_role_principal": principalObj,
				"role_id":                 types.StringValue(role.RoleID),
			},
		)
		resourceRolesValues = append(resourceRolesValues, roleObj)
	}

	// Create the set from the slice of attr.Value
	resourceRolesSet, _ := types.SetValue(
		types.ObjectType{
			AttrTypes: map[string]attr.Type{
				"resource_role_principal": types.ObjectType{
					AttrTypes: map[string]attr.Type{
						"type":           types.StringType,
						"principal_id":   types.StringType,
						"principal_type": types.StringType,
					},
				},
				"role_id": types.StringType,
			},
		},
		resourceRolesValues,
	)

	// Update the state
	if len(resourceRolesValues) > 0 {
		state.ProjectResourceRoles = resourceRolesSet
	}
	return nil
}

func (r *projectResourceRolesResource) ReadProjectResourceRolesOnCreation(ctx context.Context, plan *projectResourceRolesResourceModel) ([]ResourceRole, error) {
	pageSize := constants.PageSize
	filesystemListResourceRolesParams := v2.FilesystemListResourceRolesParams{PageSize: &pageSize}
	httpResp, err := r.client.FilesystemListResourceRoles(ctx, plan.ProjectRid.ValueString(), &filesystemListResourceRolesParams)

	if err != nil {
		return nil, fmt.Errorf("FilesystemListResourceRoles request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusOK {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			return nil, fmt.Errorf("failed to format error logging from FilesystemListResourceRoles response: %w", err)
		}
		return nil, errors.New(returnString)
	}

	bodyBytes, err := helper.ExtractBodyFromResponse(httpResp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse response from FilesystemListResourceRoles: %w", err)
	}

	var httpListResourceRoles ResourceRolesResponse
	if err := json.Unmarshal(bodyBytes, &httpListResourceRoles); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}
	// Build a slice of attr.Value for the set
	var resourceRolesValues []attr.Value
	for _, role := range httpListResourceRoles.Roles {
		// Build the inner object
		principalObj, _ := types.ObjectValue(
			map[string]attr.Type{
				"type":           types.StringType,
				"principal_id":   types.StringType,
				"principal_type": types.StringType,
			},
			map[string]attr.Value{
				"type":           types.StringValue(role.ResourceRolePrincipal.Type),
				"principal_id":   types.StringValue(role.ResourceRolePrincipal.PrincipalID),
				"principal_type": types.StringValue(role.ResourceRolePrincipal.PrincipalType),
			},
		)

		// Build the outer object
		roleObj, _ := types.ObjectValue(
			map[string]attr.Type{
				"resource_role_principal": types.ObjectType{
					AttrTypes: map[string]attr.Type{
						"type":           types.StringType,
						"principal_id":   types.StringType,
						"principal_type": types.StringType,
					},
				},
				"role_id": types.StringType,
			},
			map[string]attr.Value{
				"resource_role_principal": principalObj,
				"role_id":                 types.StringValue(role.RoleID),
			},
		)
		resourceRolesValues = append(resourceRolesValues, roleObj)
	}

	resourceRolesSet, _ := types.SetValue(
		types.ObjectType{
			AttrTypes: map[string]attr.Type{
				"resource_role_principal": types.ObjectType{
					AttrTypes: map[string]attr.Type{
						"type":           types.StringType,
						"principal_id":   types.StringType,
						"principal_type": types.StringType,
					},
				},
				"role_id": types.StringType,
			},
		},
		resourceRolesValues,
	)
	var rolesToReturn []ResourceRole
	diags := resourceRolesSet.ElementsAs(context.Background(), &rolesToReturn, false)
	if diags.HasError() {
		return nil, fmt.Errorf("failed to convert resource roles to Go slice")
	}

	return rolesToReturn, nil
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *projectResourceRolesResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// Retrieve values from plan
	var plan projectResourceRolesResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// Get current state
	var state projectResourceRolesResourceModel
	diags = req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.UpdateProjectResourceRoles(ctx, &plan, &state, resp)
	if err != nil {
		resp.Diagnostics.AddError("Error updating the Project resource_roles. Please fix your plan if needed and re-apply", err.Error())
	}

	diags = resp.State.Set(ctx, state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}
}

func (r *projectResourceRolesResource) UpdateProjectResourceRoles(ctx context.Context, plan *projectResourceRolesResourceModel, state *projectResourceRolesResourceModel, resp *resource.UpdateResponse) error {
	var oldResourceRoles []ResourceRole

	if !state.ProjectResourceRoles.IsNull() {
		diags := state.ProjectResourceRoles.ElementsAs(ctx, &oldResourceRoles, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert project roles to Go slice")
		}
	}

	var newResourceRoles []ResourceRole
	if !plan.ProjectResourceRoles.IsNull() {
		diags := plan.ProjectResourceRoles.ElementsAs(ctx, &newResourceRoles, false)
		if diags.HasError() {
			return fmt.Errorf("failed to convert project roles to Go slice")
		}
	}

	if !slices.Equal(oldResourceRoles, newResourceRoles) {
		// Determine members to add and remove
		rolesToAdd, rolesToRemove := DiffResourceRoles(oldResourceRoles, newResourceRoles)
		if len(rolesToAdd) != 0 {
			err := r.AddProjectResourceRoles(ctx, rolesToAdd, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		}
		if len(rolesToRemove) != 0 && !r.deletionsDisabled {
			err := r.RemoveProjectResourceRoles(ctx, rolesToRemove, plan.ProjectRid.ValueString())
			if err != nil {
				return err
			}
		} else if len(rolesToRemove) != 0 {
			resp.Diagnostics.AddWarning("Found organization members defined in the state that are not in the plan.",
				"Since `deletions_disabled` is set to true, organization-member-removal operations will not be applied.")
		}
		state.ProjectResourceRoles = plan.ProjectResourceRoles
	}
	return nil
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *projectResourceRolesResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	// Retrieve values from state
	var state projectResourceRolesResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	resp.Diagnostics.AddWarning("Called Delete on a project resource_roles resource.",
		fmt.Sprintf("The resource_roles resource for project rid %s will be removed from state, but no resource_roles will be removed remotely.", state.ProjectRid.ValueString()))

}

// ImportState imports existing project resource_roles into Terraform state.
func (r *projectResourceRolesResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
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

	tflog.Info(ctx, fmt.Sprintf("Importing project resource_roles for project with ID %s", projectRID))

	// Set the Project RID in state
	resp.Diagnostics.Append(resp.State.SetAttribute(ctx, path.Root("project_rid"), projectRID)...)

	// The Read method will be called automatically after ImportState
	// to refresh all the other attributes based on the RID
}

func (r *projectResourceRolesResource) AddProjectResourceRoles(ctx context.Context, rolesToAdd []ResourceRole, id string) error {
	roleUpdates := make([]v2.FilesystemResourceRoleIdentifier, len(rolesToAdd))

	for i, role := range rolesToAdd {
		principal := v2.FilesystemResourceRolePrincipalIdentifier{}
		if role.ResourceRolePrincipal.Type == constants.PrincipalWithID {
			if role.ResourceRolePrincipal.PrincipalID == nil {
				return fmt.Errorf("principal ID must be provided for principal type %s", constants.PrincipalWithID)
			}
			principalIDAsUUID, err := uuid.Parse(*role.ResourceRolePrincipal.PrincipalID)

			if err != nil {
				return fmt.Errorf("invalid UUID format for principal ID %s: %w", *role.ResourceRolePrincipal.PrincipalID, err)
			}

			err = principal.FromFilesystemPrincipalIDOnly(v2.FilesystemPrincipalIDOnly{
				PrincipalID: principalIDAsUUID,
				Type:        role.ResourceRolePrincipal.Type,
			})
			roleUpdates[i] = v2.FilesystemResourceRoleIdentifier{
				ResourceRolePrincipal: principal,
				RoleID:                role.RoleID,
			}
			if err != nil {
				return fmt.Errorf("FilesystemPrincipalWithID request failed: %w", err)
			}
		}

		if role.ResourceRolePrincipal.Type == constants.Everyone {
			err := principal.FromFilesystemEveryone(v2.FilesystemEveryone{
				Type: role.ResourceRolePrincipal.Type,
			})
			roleUpdates[i] = v2.FilesystemResourceRoleIdentifier{
				ResourceRolePrincipal: principal,
				RoleID:                role.RoleID,
			}
			if err != nil {
				return fmt.Errorf("FilesystemPrincipalWithID request failed: %w", err)
			}
		}
	}

	httpResp, err := r.client.FilesystemAddResourceRoles(ctx, id, v2.FilesystemAddResourceRolesJSONRequestBody{
		Roles: &roleUpdates,
	})

	if err != nil {
		return fmt.Errorf("FilesystemAddResourceRoles request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			log.Fatal(err)
		}
		return errors.New(returnString)
	}

	return nil
}

func (r *projectResourceRolesResource) RemoveProjectResourceRoles(ctx context.Context, rolesToRemove []ResourceRole, id string) error {

	roleUpdates := make([]v2.FilesystemResourceRoleIdentifier, len(rolesToRemove))

	for i, role := range rolesToRemove {
		principal := v2.FilesystemResourceRolePrincipalIdentifier{}
		if role.ResourceRolePrincipal.Type == constants.PrincipalWithID {
			if role.ResourceRolePrincipal.PrincipalID == nil {
				return fmt.Errorf("principal ID must be provided for principal type %s", constants.PrincipalWithID)
			}
			principalIDAsUUID, err := uuid.Parse(*role.ResourceRolePrincipal.PrincipalID)

			if err != nil {
				return fmt.Errorf("invalid UUID format for principal ID %s: %w", *role.ResourceRolePrincipal.PrincipalID, err)
			}

			err = principal.FromFilesystemPrincipalIDOnly(v2.FilesystemPrincipalIDOnly{
				PrincipalID: principalIDAsUUID,
				Type:        role.ResourceRolePrincipal.Type,
			})
			roleUpdates[i] = v2.FilesystemResourceRoleIdentifier{
				ResourceRolePrincipal: principal,
				RoleID:                role.RoleID,
			}
			if err != nil {
				return fmt.Errorf("FilesystemPrincipalWithID request failed: %w", err)
			}
		}

		if role.ResourceRolePrincipal.Type == constants.Everyone {
			err := principal.FromFilesystemEveryone(v2.FilesystemEveryone{
				Type: role.ResourceRolePrincipal.Type,
			})
			roleUpdates[i] = v2.FilesystemResourceRoleIdentifier{
				ResourceRolePrincipal: principal,
				RoleID:                role.RoleID,
			}
			if err != nil {
				return fmt.Errorf("FilesystemPrincipalWithID request failed: %w", err)
			}
		}
	}

	httpResp, err := r.client.FilesystemRemoveResourceRoles(ctx, id, v2.FilesystemRemoveResourceRolesJSONRequestBody{
		Roles: &roleUpdates,
	})

	if err != nil {
		return fmt.Errorf("FilesystemRemoveResourceRoles request failed: %w", err)
	}

	// Check the response status code
	if httpResp.StatusCode != http.StatusNoContent {
		returnString, err := providerError.FormatHTTPError(httpResp)
		if err != nil {
			log.Fatal(err)
		}
		return errors.New(returnString)
	}

	return nil
}

func DiffResourceRoles(oldResourceRoles, newResourceRoles []ResourceRole) (added, removed []ResourceRole) {
	oldMap := make(map[string]ResourceRole)
	newMap := make(map[string]ResourceRole)

	// Helper to create a unique key for each RoleResource
	makeKey := func(r ResourceRole) string {
		p := r.ResourceRolePrincipal
		if p.PrincipalID == nil || p.PrincipalType == nil {
			return r.RoleID + "|" + p.Type
		}
		return r.RoleID + "|" + p.Type + "|" + *p.PrincipalID + "|" + *p.PrincipalType
	}

	for _, r := range oldResourceRoles {
		oldMap[makeKey(r)] = r
	}
	for _, r := range newResourceRoles {
		newMap[makeKey(r)] = r
	}

	// Find added
	for k, r := range newMap {
		if _, exists := oldMap[k]; !exists {
			added = append(added, r)
		}
	}
	// Find removed
	for k, r := range oldMap {
		if _, exists := newMap[k]; !exists {
			removed = append(removed, r)
		}
	}
	return added, removed
}
