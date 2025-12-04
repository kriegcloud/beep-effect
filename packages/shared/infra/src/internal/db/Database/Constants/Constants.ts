import {PgErrorCodeFromKey} from "../pg-error-enum";

/**
 * - A transaction can modify up to 3,000 rows, regardless of the number of secondary indexes
 * - The 3,000-row limit applies to all DML statements (INSERT, UPDATE, DELETE)
 *
 * See: https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-postgresql-compatibility-unsupported-features.html#working-with-postgresql-compatibility-unsupported-limitations
 */
export const DB_TRANSACTION_ROW_MODIFICATION_LIMIT = 3_000;

export const DB_TRANSACTION_MAX_RETRIES = 10;
export const PG_SERIALIZATION_FAILURE_ERROR_CODE = PgErrorCodeFromKey.Enum.T_R_SERIALIZATION_FAILURE;
export const PG_DEADLOCK_DETECTED_ERROR_CODE = PgErrorCodeFromKey.Enum.T_R_DEADLOCK_DETECTED;
export const VARCHAR_LENGTH = 50;

