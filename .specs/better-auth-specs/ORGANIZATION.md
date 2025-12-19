# Organization API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: Multi-tenant organization and team management

**Priority**: P1
**Milestones**: M10
**Endpoint Count**: 35

## Endpoints

### `POST /organization/accept-invitation`

**Description**: Accept an invitation to an organization

**Better Auth Method**: `acceptInvitation`

**Request Body**:

| Field        | Type   | Required | Description                        |
|--------------|--------|----------|------------------------------------|
| invitationId | string | Yes      | The ID of the invitation to accept |

**Success Response** (`200`):

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| invitation | object | No       |             |
| member     | object | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/add-team-member`

**Description**: The newly created member

**Better Auth Method**: `addTeamMember`

**Request Body**:

| Field  | Type   | Required | Description                                                    |
|--------|--------|----------|----------------------------------------------------------------|
| teamId | string | Yes      | The team the user should be a member of.                       |
| userId | string | Yes      | The user Id which represents the user to be added as a member. |

**Success Response** (`200`):

| Field     | Type               | Required | Description                                   |
|-----------|--------------------|----------|-----------------------------------------------|
| id        | string             | Yes      | Unique identifier of the team member          |
| userId    | string             | Yes      | The user ID of the team member                |
| teamId    | string             | Yes      | The team ID of the team the team member is in |
| createdAt | string (date-time) | Yes      | Timestamp when the team member was created    |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/cancel-invitation`

**Better Auth Method**: `cancelInvitation`

**Request Body**:

| Field        | Type   | Required | Description                        |
|--------------|--------|----------|------------------------------------|
| invitationId | string | Yes      | The ID of the invitation to cancel |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/check-slug`

**Better Auth Method**: `checkSlug`

**Request Body**:

| Field | Type   | Required | Description                                  |
|-------|--------|----------|----------------------------------------------|
| slug  | string | Yes      | The organization slug to check. Eg: "my-org" |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/create`

**Description**: Create an organization

**Better Auth Method**: `createOrganization`

**Request Body**:

| Field                         | Type    | Required | Description                                                                                                                                                                     |
|-------------------------------|---------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name                          | string  | Yes      | The name of the organization                                                                                                                                                    |
| slug                          | string  | Yes      | The slug of the organization                                                                                                                                                    |
| userId                        | string  | No       | The user id of the organization creator. If not provided, the current user will be used. Should only be used by admins or when called by the server. server-only. Eg: "user-id" |
| logo                          | string  | No       | The logo of the organization                                                                                                                                                    |
| metadata                      | string  | No       | The metadata of the organization                                                                                                                                                |
| keepCurrentActiveOrganization | boolean | No       | Whether to keep the current active organization active after creating a new one. Eg: true                                                                                       |
| type                          | string  | Yes      |                                                                                                                                                                                 |
| ownerUserId                   | string  | No       |                                                                                                                                                                                 |
| isPersonal                    | boolean | Yes      |                                                                                                                                                                                 |
| maxMembers                    | number  | No       |                                                                                                                                                                                 |
| features                      | string  | No       |                                                                                                                                                                                 |
| settings                      | string  | No       |                                                                                                                                                                                 |
| subscriptionTier              | string  | No       |                                                                                                                                                                                 |
| subscriptionStatus            | string  | No       |                                                                                                                                                                                 |
| _rowId                        | number  | No       |                                                                                                                                                                                 |
| deletedAt                     | string  | No       |                                                                                                                                                                                 |
| updatedAt                     | string  | No       |                                                                                                                                                                                 |
| createdAt                     | string  | No       |                                                                                                                                                                                 |
| createdBy                     | string  | No       |                                                                                                                                                                                 |
| updatedBy                     | string  | No       |                                                                                                                                                                                 |
| deletedBy                     | string  | No       |                                                                                                                                                                                 |
| version                       | number  | No       |                                                                                                                                                                                 |
| source                        | string  | No       |                                                                                                                                                                                 |

**Success Response** (`200`):

See [`Organization`](SCHEMAS.md#organization)

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/create-role`

**Better Auth Method**: `createRole`

**Request Body**:

| Field            | Type   | Required | Description                          |
|------------------|--------|----------|--------------------------------------|
| organizationId   | string | No       |                                      |
| role             | string | Yes      | The name of the role to create       |
| permission       | string | Yes      | The permission to assign to the role |
| additionalFields | object | No       |                                      |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/create-team`

**Description**: Create a new team within an organization

**Better Auth Method**: `createTeam`

**Request Body**:

| Field          | Type   | Required | Description                                                                                                       |
|----------------|--------|----------|-------------------------------------------------------------------------------------------------------------------|
| name           | string | Yes      | The name of the team. Eg: "my-team"                                                                               |
| organizationId | string | No       | The organization ID which the team will be created in. Defaults to the active organization. Eg: "organization-id" |
| description    | string | No       |                                                                                                                   |
| metadata       | string | No       |                                                                                                                   |
| logo           | string | No       |                                                                                                                   |
| _rowId         | number | No       |                                                                                                                   |
| deletedAt      | string | No       |                                                                                                                   |
| updatedAt      | string | No       |                                                                                                                   |
| createdAt      | string | No       |                                                                                                                   |
| createdBy      | string | No       |                                                                                                                   |
| updatedBy      | string | No       |                                                                                                                   |
| deletedBy      | string | No       |                                                                                                                   |
| version        | number | No       |                                                                                                                   |
| source         | string | No       |                                                                                                                   |

**Success Response** (`200`):

| Field          | Type               | Required | Description                                |
|----------------|--------------------|----------|--------------------------------------------|
| id             | string             | Yes      | Unique identifier of the created team      |
| name           | string             | Yes      | Name of the team                           |
| organizationId | string             | Yes      | ID of the organization the team belongs to |
| createdAt      | string (date-time) | Yes      | Timestamp when the team was created        |
| updatedAt      | string (date-time) | Yes      | Timestamp when the team was last updated   |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/delete`

**Description**: Delete an organization

**Better Auth Method**: `deleteOrganization`

**Request Body**:

| Field          | Type   | Required | Description                   |
|----------------|--------|----------|-------------------------------|
| organizationId | string | Yes      | The organization id to delete |

**Success Response** (`200`):

Success

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/delete-role`

**Better Auth Method**: `deleteRole`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/get-active-member`

**Description**: Get the member details of the active organization

**Better Auth Method**: `getActiveMember`

**Success Response** (`200`):

| Field          | Type   | Required | Description |
|----------------|--------|----------|-------------|
| id             | string | Yes      |             |
| userId         | string | Yes      |             |
| organizationId | string | Yes      |             |
| role           | string | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/get-active-member-role`

**Better Auth Method**: `getActiveMemberRole`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/get-full-organization`

**Description**: Get the full organization

**Better Auth Method**: `getFullOrganization`

**Success Response** (`200`):

See [`Organization`](SCHEMAS.md#organization)

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/get-invitation`

**Description**: Get an invitation by ID

**Better Auth Method**: `getInvitation`

**Parameters**:

| Name | Location | Type   | Required | Description |
|------|----------|--------|----------|-------------|
| id   | query    | string | No       |             |

**Success Response** (`200`):

| Field            | Type   | Required | Description |
|------------------|--------|----------|-------------|
| id               | string | Yes      |             |
| email            | string | Yes      |             |
| role             | string | Yes      |             |
| organizationId   | string | Yes      |             |
| inviterId        | string | Yes      |             |
| status           | string | Yes      |             |
| expiresAt        | string | Yes      |             |
| organizationName | string | Yes      |             |
| organizationSlug | string | Yes      |             |
| inviterEmail     | string | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/get-role`

**Better Auth Method**: `getRole`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/has-permission`

**Description**: Check if the user has permission

**Better Auth Method**: `hasPermission`

**Request Body**:

| Field       | Type   | Required | Description             |
|-------------|--------|----------|-------------------------|
| permission  | object | No       | The permission to check |
| permissions | object | Yes      | The permission to check |

**Success Response** (`200`):

| Field   | Type    | Required | Description |
|---------|---------|----------|-------------|
| error   | string  | No       |             |
| success | boolean | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/invite-member`

**Description**: Create an invitation to an organization

**Better Auth Method**: `inviteMember`

**Request Body**:

| Field          | Type    | Required | Description                                                                         |
|----------------|---------|----------|-------------------------------------------------------------------------------------|
| email          | string  | Yes      | The email address of the user to invite                                             |
| role           | string  | Yes      | The role(s) to assign to the user. It can be `admin`, `member`, owner. Eg: "member" |
| organizationId | string  | No       | The organization ID to invite the user to                                           |
| resend         | boolean | No       | Resend the invitation email, if the user is already invited. Eg: true               |
| teamId         | string  | Yes      |                                                                                     |
| _rowId         | number  | No       |                                                                                     |
| deletedAt      | string  | No       |                                                                                     |
| updatedAt      | string  | No       |                                                                                     |
| createdAt      | string  | No       |                                                                                     |
| createdBy      | string  | No       |                                                                                     |
| updatedBy      | string  | No       |                                                                                     |
| deletedBy      | string  | No       |                                                                                     |
| version        | number  | No       |                                                                                     |
| source         | string  | No       |                                                                                     |

**Success Response** (`200`):

| Field          | Type   | Required | Description |
|----------------|--------|----------|-------------|
| id             | string | Yes      |             |
| email          | string | Yes      |             |
| role           | string | Yes      |             |
| organizationId | string | Yes      |             |
| inviterId      | string | Yes      |             |
| status         | string | Yes      |             |
| expiresAt      | string | Yes      |             |
| createdAt      | string | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/leave`

**Better Auth Method**: `leaveOrganization`

**Request Body**:

| Field          | Type   | Required | Description                                                        |
|----------------|--------|----------|--------------------------------------------------------------------|
| organizationId | string | Yes      | The organization Id for the member to leave. Eg: "organization-id" |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/list`

**Description**: List all organizations

**Better Auth Method**: `listOrganizations`

**Success Response** (`200`):

Success

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/list-invitations`

**Better Auth Method**: `listInvitations`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/list-members`

**Better Auth Method**: `listMembers`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/list-roles`

**Better Auth Method**: `listRoles`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/list-team-members`

**Description**: List the members of the given team.

**Better Auth Method**: `listTeamMembers`

**Success Response** (`200`):

Teams retrieved successfully

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/list-teams`

**Description**: List all teams in an organization

**Better Auth Method**: `listTeams`

**Success Response** (`200`):

Teams retrieved successfully

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/list-user-invitations`

**Description**: List all invitations a user has received

**Better Auth Method**: `listUserInvitations`

**Success Response** (`200`):

Success

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /organization/list-user-teams`

**Description**: List all teams that the current user is a part of.

**Better Auth Method**: `listUserTeams`

**Success Response** (`200`):

Teams retrieved successfully

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/reject-invitation`

**Description**: Reject an invitation to an organization

**Better Auth Method**: `rejectInvitation`

**Request Body**:

| Field        | Type   | Required | Description                        |
|--------------|--------|----------|------------------------------------|
| invitationId | string | Yes      | The ID of the invitation to reject |

**Success Response** (`200`):

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| invitation | object | No       |             |
| member     | object | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/remove-member`

**Description**: Remove a member from an organization

**Better Auth Method**: `removeMember`

**Request Body**:

| Field           | Type   | Required | Description                                                                                                               |
|-----------------|--------|----------|---------------------------------------------------------------------------------------------------------------------------|
| memberIdOrEmail | string | Yes      | The ID or email of the member to remove                                                                                   |
| organizationId  | string | No       | The ID of the organization to remove the member from. If not provided, the active organization will be used. Eg: "org-id" |

**Success Response** (`200`):

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| member | object | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/remove-team`

**Description**: Remove a team from an organization

**Better Auth Method**: `deleteTeam`

**Request Body**:

| Field          | Type   | Required | Description                                                                                                                               |
|----------------|--------|----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| teamId         | string | Yes      | The team ID of the team to remove. Eg: "team-id"                                                                                          |
| organizationId | string | No       | The organization ID which the team falls under. If not provided, it will default to the user's active organization. Eg: "organization-id" |

**Success Response** (`200`):

| Field   | Type                                  | Required | Description                                        |
|---------|---------------------------------------|----------|----------------------------------------------------|
| message | string (`Team removed successfully.`) | Yes      | Confirmation message indicating successful removal |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/remove-team-member`

**Description**: Remove a member from a team

**Better Auth Method**: `removeTeamMember`

**Request Body**:

| Field  | Type   | Required | Description                                     |
|--------|--------|----------|-------------------------------------------------|
| teamId | string | Yes      | The team the user should be removed from.       |
| userId | string | Yes      | The user which should be removed from the team. |

**Success Response** (`200`):

| Field   | Type                                         | Required | Description                                        |
|---------|----------------------------------------------|----------|----------------------------------------------------|
| message | string (`Team member removed successfully.`) | Yes      | Confirmation message indicating successful removal |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/set-active`

**Description**: Set the active organization

**Better Auth Method**: `setActiveOrganization`

**Request Body**:

| Field            | Type   | Required | Description                                                                                                                               |
|------------------|--------|----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| organizationId   | string | No       |                                                                                                                                           |
| organizationSlug | string | No       | The organization slug to set as active. It can be null to unset the active organization if organizationId is not provided. Eg: "org-slug" |

**Success Response** (`200`):

See [`Organization`](SCHEMAS.md#organization)

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/set-active-team`

**Description**: Set the active team

**Better Auth Method**: `setActiveTeam`

**Request Body**:

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| teamId | string | No       |             |

**Success Response** (`200`):

See [`Team`](SCHEMAS.md#team)

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/update`

**Description**: Update an organization

**Better Auth Method**: `updateOrganization`

**Request Body**:

| Field          | Type   | Required | Description                       |
|----------------|--------|----------|-----------------------------------|
| data           | object | Yes      |                                   |
| organizationId | string | No       | The organization ID. Eg: "org-id" |

**Success Response** (`200`):

See [`Organization`](SCHEMAS.md#organization)

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/update-member-role`

**Description**: Update the role of a member in an organization

**Better Auth Method**: `updateMemberRole`

**Request Body**:

| Field          | Type   | Required | Description                                                                                                                                                                                 |
|----------------|--------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| role           | string | Yes      | The new role to be applied. This can be a string or array of strings representing the roles. Eg: ["admin", "sale"]                                                                          |
| memberId       | string | Yes      | The member id to apply the role update to. Eg: "member-id"                                                                                                                                  |
| organizationId | string | No       | An optional organization ID which the member is a part of to apply the role update. If not provided, you must provide session headers to get the active organization. Eg: "organization-id" |

**Success Response** (`200`):

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| member | object | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/update-role`

**Better Auth Method**: `updateRole`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /organization/update-team`

**Description**: Update an existing team in an organization

**Better Auth Method**: `updateTeam`

**Request Body**:

| Field  | Type   | Required | Description                                     |
|--------|--------|----------|-------------------------------------------------|
| teamId | string | Yes      | The ID of the team to be updated. Eg: "team-id" |
| data   | object | Yes      |                                                 |

**Success Response** (`200`):

| Field          | Type               | Required | Description                                |
|----------------|--------------------|----------|--------------------------------------------|
| id             | string             | Yes      | Unique identifier of the updated team      |
| name           | string             | Yes      | Updated name of the team                   |
| organizationId | string             | Yes      | ID of the organization the team belongs to |
| createdAt      | string (date-time) | Yes      | Timestamp when the team was created        |
| updatedAt      | string (date-time) | Yes      | Timestamp when the team was last updated   |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---
