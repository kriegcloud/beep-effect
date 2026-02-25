# P1 Network and Security Baseline

## Owner

- `security-architecture`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/aws-first-reference-architecture.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/policy-plane-design.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/compliance-control-mapping.md`
- `../p1-foundation-build/foundation-stack-plan.md`

## Exact Tasks

1. Establish VPC baseline with private subnets for workloads and restricted public ingress paths.
2. Enforce account-level guardrails using SCP and IAM permission boundaries.
3. Enable audit and control logging for CloudTrail and CloudWatch with immutable retention policy.
4. Apply KMS key policies for policy signing, audit encryption, and runtime secret encryption.
5. Validate network segmentation, deny-by-default security groups, and egress controls.

## Entry Criteria

- Foundation stack plan is approved.
- Account-level access and policy admin roles are active.
- Key-management ownership is assigned.

## Exit Criteria

- Network topology and security guardrails are deployed and verified in all environments.
- Logging and key-management controls are active and auditable.
- Baseline checks required for G2 are passed.

## Verification Commands

```sh
aws ec2 describe-vpcs --filters Name=tag:Stack,Values=foundation
```

```sh
aws organizations list-policies --filter SERVICE_CONTROL_POLICY
```

```sh
aws cloudtrail describe-trails
```

```sh
aws kms list-keys
```

## Rollback/Safety Notes

- Do not remove active SCP controls without security-architecture approval.
- If segmentation checks fail, halt external ingress enablement and rollback to last approved network policy set.
- Key policy rollback must retain decrypt access for audit recovery paths.

## Baseline Control Set

| Control Area | Baseline Requirement | Validation Signal |
|---|---|---|
| Network segmentation | private workload subnets and controlled ingress | VPC route and security group inspection |
| Access guardrails | SCP deny boundaries and IAM permission boundaries | SCP policy listing and IAM policy attachment checks |
| Audit logging | CloudTrail and CloudWatch enabled with retention policy | trail status and log-group retention inspection |
| Key governance | KMS keys with role-scoped access | key policy review and test decrypt checks |
