/**
 * PermissionMatrix - RBAC permission matrix
 *
 * Defines which actions are allowed for each base role and functional role.
 * This is the hardcoded RBAC matrix that will be used until ABAC policies
 * are fully implemented.
 *
 * Permission precedence:
 * 1. Owner has all permissions
 * 2. Admin has all permissions except org:delete and org:transfer_ownership
 * 3. Viewer has read-only permissions (plus report:export)
 * 4. Member permissions are determined by functional roles
 *
 * @module
 * @since 0.0.0
 */
void 0;
