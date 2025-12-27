import { $SharedServerId } from "@beep/identity/packages";
import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import { reverseRecord } from "@beep/utils/data/record.utils";
import { pipe, Struct } from "effect";
import * as A from "effect/Array";

const $I = $SharedServerId.create("internal/db/pg/pg-error-enum");

export const PostgresErrorEnum = {
  /** Class 00 - Successful Completion: [S] successful_completion */
  SUCCESSFUL_COMPLETION: "00000",
  /** Class 01 - Warning: [W] warning */
  WARNING: "01000",
  /** Class 01 - Warning: [W] dynamic_result_sets_returned */
  WARNING_DYNAMIC_RESULT_SETS_RETURNED: "0100C",
  /** Class 01 - Warning: [W] implicit_zero_bit_padding */
  WARNING_IMPLICIT_ZERO_BIT_PADDING: "01008",
  /** Class 01 - Warning: [W] null_value_eliminated_in_set_function */
  WARNING_NULL_VALUE_ELIMINATED_IN_SET_FUNCTION: "01003",
  /** Class 01 - Warning: [W] privilege_not_granted */
  WARNING_PRIVILEGE_NOT_GRANTED: "01007",
  /** Class 01 - Warning: [W] privilege_not_revoked */
  WARNING_PRIVILEGE_NOT_REVOKED: "01006",
  /** Class 01 - Warning: [W] string_data_right_truncation */
  WARNING_STRING_DATA_RIGHT_TRUNCATION: "01004",
  /** Class 01 - Warning: [W] deprecated_feature */
  WARNING_DEPRECATED_FEATURE: "01P01",
  /** Class 02 - No Data (this is also a warning class per the SQL standard): [W] no_data */
  NO_DATA: "02000",
  /** Class 02 - No Data (this is also a warning class per the SQL standard): [W] no_additional_dynamic_result_sets_returned */
  NO_ADDITIONAL_DYNAMIC_RESULT_SETS_RETURNED: "02001",
  /** Class 03 - SQL Statement Not Yet Complete: [E] sql_statement_not_yet_complete */
  SQL_STATEMENT_NOT_YET_COMPLETE: "03000",
  /** Class 08 - Connection Exception: [E] connection_exception */
  CONNECTION_EXCEPTION: "08000",
  /** Class 08 - Connection Exception: [E] connection_does_not_exist */
  CONNECTION_DOES_NOT_EXIST: "08003",
  /** Class 08 - Connection Exception: [E] connection_failure */
  CONNECTION_FAILURE: "08006",
  /** Class 08 - Connection Exception: [E] sqlclient_unable_to_establish_sqlconnection */
  SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION: "08001",
  /** Class 08 - Connection Exception: [E] sqlserver_rejected_establishment_of_sqlconnection */
  SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION: "08004",
  /** Class 08 - Connection Exception: [E] transaction_resolution_unknown */
  TRANSACTION_RESOLUTION_UNKNOWN: "08007",
  /** Class 08 - Connection Exception: [E] protocol_violation */
  PROTOCOL_VIOLATION: "08P01",
  /** Class 09 - Triggered Action Exception: [E] triggered_action_exception */
  TRIGGERED_ACTION_EXCEPTION: "09000",
  /** Class 0A - Feature Not Supported: [E] feature_not_supported */
  FEATURE_NOT_SUPPORTED: "0A000",
  /** Class 0B - Invalid Transaction Initiation: [E] invalid_transaction_initiation */
  INVALID_TRANSACTION_INITIATION: "0B000",
  /** Class 0F - Locator Exception: [E] locator_exception */
  LOCATOR_EXCEPTION: "0F000",
  /** Class 0F - Locator Exception: [E] invalid_locator_specification */
  L_E_INVALID_SPECIFICATION: "0F001",
  /** Class 0L - Invalid Grantor: [E] invalid_grantor */
  INVALID_GRANTOR: "0L000",
  /** Class 0L - Invalid Grantor: [E] invalid_grant_operation */
  INVALID_GRANT_OPERATION: "0LP01",
  /** Class 0P - Invalid Role Specification: [E] invalid_role_specification */
  INVALID_ROLE_SPECIFICATION: "0P000",
  /** Class 0Z - Diagnostics Exception: [E] diagnostics_exception */
  DIAGNOSTICS_EXCEPTION: "0Z000",
  /** Class 0Z - Diagnostics Exception: [E] stacked_diagnostics_accessed_without_active_handler */
  STACKED_DIAGNOSTICS_ACCESSED_WITHOUT_ACTIVE_HANDLER: "0Z002",
  /** Class 20 - Case Not Found: [E] case_not_found */
  CASE_NOT_FOUND: "20000",
  /** Class 21 - Cardinality Violation: [E] cardinality_violation */
  CARDINALITY_VIOLATION: "21000",
  /** Class 22 - Data Exception: [E] data_exception */
  DATA_EXCEPTION: "22000",
  /** Class 22 - Data Exception: [E]  */
  ARRAY_ELEMENT_ERROR: "2202E",
  /** Class 22 - Data Exception: [E] array_subscript_error */
  ARRAY_SUBSCRIPT_ERROR: "2202E",
  /** Class 22 - Data Exception: [E] character_not_in_repertoire */
  CHARACTER_NOT_IN_REPERTOIRE: "22021",
  /** Class 22 - Data Exception: [E] datetime_field_overflow */
  DATETIME_FIELD_OVERFLOW: "22008",
  /** Class 22 - Data Exception: [E]  */
  DATETIME_VALUE_OUT_OF_RANGE: "22008",
  /** Class 22 - Data Exception: [E] division_by_zero */
  DIVISION_BY_ZERO: "22012",
  /** Class 22 - Data Exception: [E] error_in_assignment */
  ERROR_IN_ASSIGNMENT: "22005",
  /** Class 22 - Data Exception: [E] escape_character_conflict */
  ESCAPE_CHARACTER_CONFLICT: "2200B",
  /** Class 22 - Data Exception: [E] indicator_overflow */
  INDICATOR_OVERFLOW: "22022",
  /** Class 22 - Data Exception: [E] interval_field_overflow */
  INTERVAL_FIELD_OVERFLOW: "22015",
  /** Class 22 - Data Exception: [E] invalid_argument_for_logarithm */
  INVALID_ARGUMENT_FOR_LOG: "2201E",
  /** Class 22 - Data Exception: [E] invalid_argument_for_ntile_function */
  INVALID_ARGUMENT_FOR_NTILE: "22014",
  /** Class 22 - Data Exception: [E] invalid_argument_for_nth_value_function */
  INVALID_ARGUMENT_FOR_NTH_VALUE: "22016",
  /** Class 22 - Data Exception: [E] invalid_argument_for_power_function */
  INVALID_ARGUMENT_FOR_POWER_FUNCTION: "2201F",
  /** Class 22 - Data Exception: [E] invalid_argument_for_width_bucket_function */
  INVALID_ARGUMENT_FOR_WIDTH_BUCKET_FUNCTION: "2201G",
  /** Class 22 - Data Exception: [E] invalid_character_value_for_cast */
  INVALID_CHARACTER_VALUE_FOR_CAST: "22018",
  /** Class 22 - Data Exception: [E] invalid_datetime_format */
  INVALID_DATETIME_FORMAT: "22007",
  /** Class 22 - Data Exception: [E] invalid_escape_character */
  INVALID_ESCAPE_CHARACTER: "22019",
  /** Class 22 - Data Exception: [E] invalid_escape_octet */
  INVALID_ESCAPE_OCTET: "2200D",
  /** Class 22 - Data Exception: [E] invalid_escape_sequence */
  INVALID_ESCAPE_SEQUENCE: "22025",
  /** Class 22 - Data Exception: [E] nonstandard_use_of_escape_character */
  NONSTANDARD_USE_OF_ESCAPE_CHARACTER: "22P06",
  /** Class 22 - Data Exception: [E] invalid_indicator_parameter_value */
  INVALID_INDICATOR_PARAMETER_VALUE: "22010",
  /** Class 22 - Data Exception: [E] invalid_parameter_value */
  INVALID_PARAMETER_VALUE: "22023",
  /** Class 22 - Data Exception: [E] invalid_preceding_or_following_size */
  INVALID_PRECEDING_OR_FOLLOWING_SIZE: "22013",
  /** Class 22 - Data Exception: [E] invalid_regular_expression */
  INVALID_REGULAR_EXPRESSION: "2201B",
  /** Class 22 - Data Exception: [E] invalid_row_count_in_limit_clause */
  INVALID_ROW_COUNT_IN_LIMIT_CLAUSE: "2201W",
  /** Class 22 - Data Exception: [E] invalid_row_count_in_result_offset_clause */
  INVALID_ROW_COUNT_IN_RESULT_OFFSET_CLAUSE: "2201X",
  /** Class 22 - Data Exception: [E] invalid_tablesample_argument */
  INVALID_TABLESAMPLE_ARGUMENT: "2202H",
  /** Class 22 - Data Exception: [E] invalid_tablesample_repeat */
  INVALID_TABLESAMPLE_REPEAT: "2202G",
  /** Class 22 - Data Exception: [E] invalid_time_zone_displacement_value */
  INVALID_TIME_ZONE_DISPLACEMENT_VALUE: "22009",
  /** Class 22 - Data Exception: [E] invalid_use_of_escape_character */
  INVALID_USE_OF_ESCAPE_CHARACTER: "2200C",
  /** Class 22 - Data Exception: [E] most_specific_type_mismatch */
  MOST_SPECIFIC_TYPE_MISMATCH: "2200G",
  /** Class 22 - Data Exception: [E] null_value_not_allowed */
  NULL_VALUE_NOT_ALLOWED: "22004",
  /** Class 22 - Data Exception: [E] null_value_no_indicator_parameter */
  NULL_VALUE_NO_INDICATOR_PARAMETER: "22002",
  /** Class 22 - Data Exception: [E] numeric_value_out_of_range */
  NUMERIC_VALUE_OUT_OF_RANGE: "22003",
  /** Class 22 - Data Exception: [E] sequence_generator_limit_exceeded */
  SEQUENCE_GENERATOR_LIMIT_EXCEEDED: "2200H",
  /** Class 22 - Data Exception: [E] string_data_length_mismatch */
  STRING_DATA_LENGTH_MISMATCH: "22026",
  /** Class 22 - Data Exception: [E] string_data_right_truncation */
  STRING_DATA_RIGHT_TRUNCATION: "22001",
  /** Class 22 - Data Exception: [E] substring_error */
  SUBSTRING_ERROR: "22011",
  /** Class 22 - Data Exception: [E] trim_error */
  TRIM_ERROR: "22027",
  /** Class 22 - Data Exception: [E] unterminated_c_string */
  UNTERMINATED_C_STRING: "22024",
  /** Class 22 - Data Exception: [E] zero_length_character_string */
  ZERO_LENGTH_CHARACTER_STRING: "2200F",
  /** Class 22 - Data Exception: [E] floating_point_exception */
  FLOATING_POINT_EXCEPTION: "22P01",
  /** Class 22 - Data Exception: [E] invalid_text_representation */
  INVALID_TEXT_REPRESENTATION: "22P02",
  /** Class 22 - Data Exception: [E] invalid_binary_representation */
  INVALID_BINARY_REPRESENTATION: "22P03",
  /** Class 22 - Data Exception: [E] bad_copy_file_format */
  BAD_COPY_FILE_FORMAT: "22P04",
  /** Class 22 - Data Exception: [E] untranslatable_character */
  UNTRANSLATABLE_CHARACTER: "22P05",
  /** Class 22 - Data Exception: [E] not_an_xml_document */
  NOT_AN_XML_DOCUMENT: "2200L",
  /** Class 22 - Data Exception: [E] invalid_xml_document */
  INVALID_XML_DOCUMENT: "2200M",
  /** Class 22 - Data Exception: [E] invalid_xml_content */
  INVALID_XML_CONTENT: "2200N",
  /** Class 22 - Data Exception: [E] invalid_xml_comment */
  INVALID_XML_COMMENT: "2200S",
  /** Class 22 - Data Exception: [E] invalid_xml_processing_instruction */
  INVALID_XML_PROCESSING_INSTRUCTION: "2200T",
  /** Class 22 - Data Exception: [E] duplicate_json_object_key_value */
  DUPLICATE_JSON_OBJECT_KEY_VALUE: "22030",
  /** Class 22 - Data Exception: [E] invalid_argument_for_sql_json_datetime_function */
  INVALID_ARGUMENT_FOR_SQL_JSON_DATETIME_FUNCTION: "22031",
  /** Class 22 - Data Exception: [E] invalid_json_text */
  INVALID_JSON_TEXT: "22032",
  /** Class 22 - Data Exception: [E] invalid_sql_json_subscript */
  INVALID_SQL_JSON_SUBSCRIPT: "22033",
  /** Class 22 - Data Exception: [E] more_than_one_sql_json_item */
  MORE_THAN_ONE_SQL_JSON_ITEM: "22034",
  /** Class 22 - Data Exception: [E] no_sql_json_item */
  NO_SQL_JSON_ITEM: "22035",
  /** Class 22 - Data Exception: [E] non_numeric_sql_json_item */
  NON_NUMERIC_SQL_JSON_ITEM: "22036",
  /** Class 22 - Data Exception: [E] non_unique_keys_in_a_json_object */
  NON_UNIQUE_KEYS_IN_A_JSON_OBJECT: "22037",
  /** Class 22 - Data Exception: [E] singleton_sql_json_item_required */
  SINGLETON_SQL_JSON_ITEM_REQUIRED: "22038",
  /** Class 22 - Data Exception: [E] sql_json_array_not_found */
  SQL_JSON_ARRAY_NOT_FOUND: "22039",
  /** Class 22 - Data Exception: [E] sql_json_member_not_found */
  SQL_JSON_MEMBER_NOT_FOUND: "2203A",
  /** Class 22 - Data Exception: [E] sql_json_number_not_found */
  SQL_JSON_NUMBER_NOT_FOUND: "2203B",
  /** Class 22 - Data Exception: [E] sql_json_object_not_found */
  SQL_JSON_OBJECT_NOT_FOUND: "2203C",
  /** Class 22 - Data Exception: [E] too_many_json_array_elements */
  TOO_MANY_JSON_ARRAY_ELEMENTS: "2203D",
  /** Class 22 - Data Exception: [E] too_many_json_object_members */
  TOO_MANY_JSON_OBJECT_MEMBERS: "2203E",
  /** Class 22 - Data Exception: [E] sql_json_scalar_required */
  SQL_JSON_SCALAR_REQUIRED: "2203F",
  /** Class 22 - Data Exception: [E] sql_json_item_cannot_be_cast_to_target_type */
  SQL_JSON_ITEM_CANNOT_BE_CAST_TO_TARGET_TYPE: "2203G",
  /** Class 23 - Integrity Constraint Violation: [E] integrity_constraint_violation */
  INTEGRITY_CONSTRAINT_VIOLATION: "23000",
  /** Class 23 - Integrity Constraint Violation: [E] restrict_violation */
  RESTRICT_VIOLATION: "23001",
  /** Class 23 - Integrity Constraint Violation: [E] not_null_violation */
  NOT_NULL_VIOLATION: "23502",
  /** Class 23 - Integrity Constraint Violation: [E] foreign_key_violation */
  FOREIGN_KEY_VIOLATION: "23503",
  /** Class 23 - Integrity Constraint Violation: [E] unique_violation */
  UNIQUE_VIOLATION: "23505",
  /** Class 23 - Integrity Constraint Violation: [E] check_violation */
  CHECK_VIOLATION: "23514",
  /** Class 23 - Integrity Constraint Violation: [E] exclusion_violation */
  EXCLUSION_VIOLATION: "23P01",
  /** Class 24 - Invalid Cursor State: [E] invalid_cursor_state */
  INVALID_CURSOR_STATE: "24000",
  /** Class 25 - Invalid Transaction State: [E] invalid_transaction_state */
  INVALID_TRANSACTION_STATE: "25000",
  /** Class 25 - Invalid Transaction State: [E] active_sql_transaction */
  ACTIVE_SQL_TRANSACTION: "25001",
  /** Class 25 - Invalid Transaction State: [E] branch_transaction_already_active */
  BRANCH_TRANSACTION_ALREADY_ACTIVE: "25002",
  /** Class 25 - Invalid Transaction State: [E] held_cursor_requires_same_isolation_level */
  HELD_CURSOR_REQUIRES_SAME_ISOLATION_LEVEL: "25008",
  /** Class 25 - Invalid Transaction State: [E] inappropriate_access_mode_for_branch_transaction */
  INAPPROPRIATE_ACCESS_MODE_FOR_BRANCH_TRANSACTION: "25003",
  /** Class 25 - Invalid Transaction State: [E] inappropriate_isolation_level_for_branch_transaction */
  INAPPROPRIATE_ISOLATION_LEVEL_FOR_BRANCH_TRANSACTION: "25004",
  /** Class 25 - Invalid Transaction State: [E] no_active_sql_transaction_for_branch_transaction */
  NO_ACTIVE_SQL_TRANSACTION_FOR_BRANCH_TRANSACTION: "25005",
  /** Class 25 - Invalid Transaction State: [E] read_only_sql_transaction */
  READ_ONLY_SQL_TRANSACTION: "25006",
  /** Class 25 - Invalid Transaction State: [E] schema_and_data_statement_mixing_not_supported */
  SCHEMA_AND_DATA_STATEMENT_MIXING_NOT_SUPPORTED: "25007",
  /** Class 25 - Invalid Transaction State: [E] no_active_sql_transaction */
  NO_ACTIVE_SQL_TRANSACTION: "25P01",
  /** Class 25 - Invalid Transaction State: [E] in_failed_sql_transaction */
  IN_FAILED_SQL_TRANSACTION: "25P02",
  /** Class 25 - Invalid Transaction State: [E] idle_in_transaction_session_timeout */
  IDLE_IN_TRANSACTION_SESSION_TIMEOUT: "25P03",
  /** Class 26 - Invalid SQL Statement Name: [E] invalid_sql_statement_name */
  INVALID_SQL_STATEMENT_NAME: "26000",
  /** Class 27 - Triggered Data Change Violation: [E] triggered_data_change_violation */
  TRIGGERED_DATA_CHANGE_VIOLATION: "27000",
  /** Class 28 - Invalid Authorization Specification: [E] invalid_authorization_specification */
  INVALID_AUTHORIZATION_SPECIFICATION: "28000",
  /** Class 28 - Invalid Authorization Specification: [E] invalid_password */
  INVALID_PASSWORD: "28P01",
  /** Class 2B - Dependent Privilege Descriptors Still Exist: [E] dependent_privilege_descriptors_still_exist */
  DEPENDENT_PRIVILEGE_DESCRIPTORS_STILL_EXIST: "2B000",
  /** Class 2B - Dependent Privilege Descriptors Still Exist: [E] dependent_objects_still_exist */
  DEPENDENT_OBJECTS_STILL_EXIST: "2BP01",
  /** Class 2D - Invalid Transaction Termination: [E] invalid_transaction_termination */
  INVALID_TRANSACTION_TERMINATION: "2D000",
  /** Class 2F - SQL Routine Exception: [E] sql_routine_exception */
  SQL_ROUTINE_EXCEPTION: "2F000",
  /** Class 2F - SQL Routine Exception: [E] function_executed_no_return_statement */
  S_R_E_FUNCTION_EXECUTED_NO_RETURN_STATEMENT: "2F005",
  /** Class 2F - SQL Routine Exception: [E] modifying_sql_data_not_permitted */
  S_R_E_MODIFYING_SQL_DATA_NOT_PERMITTED: "2F002",
  /** Class 2F - SQL Routine Exception: [E] prohibited_sql_statement_attempted */
  S_R_E_PROHIBITED_SQL_STATEMENT_ATTEMPTED: "2F003",
  /** Class 2F - SQL Routine Exception: [E] reading_sql_data_not_permitted */
  S_R_E_READING_SQL_DATA_NOT_PERMITTED: "2F004",
  /** Class 34 - Invalid Cursor Name: [E] invalid_cursor_name */
  INVALID_CURSOR_NAME: "34000",
  /** Class 38 - External Routine Exception: [E] external_routine_exception */
  EXTERNAL_ROUTINE_EXCEPTION: "38000",
  /** Class 38 - External Routine Exception: [E] containing_sql_not_permitted */
  E_R_E_CONTAINING_SQL_NOT_PERMITTED: "38001",
  /** Class 38 - External Routine Exception: [E] modifying_sql_data_not_permitted */
  E_R_E_MODIFYING_SQL_DATA_NOT_PERMITTED: "38002",
  /** Class 38 - External Routine Exception: [E] prohibited_sql_statement_attempted */
  E_R_E_PROHIBITED_SQL_STATEMENT_ATTEMPTED: "38003",
  /** Class 38 - External Routine Exception: [E] reading_sql_data_not_permitted */
  E_R_E_READING_SQL_DATA_NOT_PERMITTED: "38004",
  /** Class 39 - External Routine Invocation Exception: [E] external_routine_invocation_exception */
  EXTERNAL_ROUTINE_INVOCATION_EXCEPTION: "39000",
  /** Class 39 - External Routine Invocation Exception: [E] invalid_sqlstate_returned */
  E_R_I_E_INVALID_SQLSTATE_RETURNED: "39001",
  /** Class 39 - External Routine Invocation Exception: [E] null_value_not_allowed */
  E_R_I_E_NULL_VALUE_NOT_ALLOWED: "39004",
  /** Class 39 - External Routine Invocation Exception: [E] trigger_protocol_violated */
  E_R_I_E_TRIGGER_PROTOCOL_VIOLATED: "39P01",
  /** Class 39 - External Routine Invocation Exception: [E] srf_protocol_violated */
  E_R_I_E_SRF_PROTOCOL_VIOLATED: "39P02",
  /** Class 39 - External Routine Invocation Exception: [E] event_trigger_protocol_violated */
  E_R_I_E_EVENT_TRIGGER_PROTOCOL_VIOLATED: "39P03",
  /** Class 3B - Savepoint Exception: [E] savepoint_exception */
  SAVEPOINT_EXCEPTION: "3B000",
  /** Class 3B - Savepoint Exception: [E] invalid_savepoint_specification */
  S_E_INVALID_SPECIFICATION: "3B001",
  /** Class 3D - Invalid Catalog Name: [E] invalid_catalog_name */
  INVALID_CATALOG_NAME: "3D000",
  /** Class 3F - Invalid Schema Name: [E] invalid_schema_name */
  INVALID_SCHEMA_NAME: "3F000",
  /** Class 40 - Transaction Rollback: [E] transaction_rollback */
  TRANSACTION_ROLLBACK: "40000",
  /** Class 40 - Transaction Rollback: [E] transaction_integrity_constraint_violation */
  T_R_INTEGRITY_CONSTRAINT_VIOLATION: "40002",
  /** Class 40 - Transaction Rollback: [E] serialization_failure */
  T_R_SERIALIZATION_FAILURE: "40001",
  /** Class 40 - Transaction Rollback: [E] statement_completion_unknown */
  T_R_STATEMENT_COMPLETION_UNKNOWN: "40003",
  /** Class 40 - Transaction Rollback: [E] deadlock_detected */
  T_R_DEADLOCK_DETECTED: "40P01",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] syntax_error_or_access_rule_violation */
  SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION: "42000",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] syntax_error */
  SYNTAX_ERROR: "42601",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] insufficient_privilege */
  INSUFFICIENT_PRIVILEGE: "42501",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] cannot_coerce */
  CANNOT_COERCE: "42846",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] grouping_error */
  GROUPING_ERROR: "42803",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] windowing_error */
  WINDOWING_ERROR: "42P20",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_recursion */
  INVALID_RECURSION: "42P19",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_foreign_key */
  INVALID_FOREIGN_KEY: "42830",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_name */
  INVALID_NAME: "42602",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] name_too_long */
  NAME_TOO_LONG: "42622",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] reserved_name */
  RESERVED_NAME: "42939",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] datatype_mismatch */
  DATATYPE_MISMATCH: "42804",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] indeterminate_datatype */
  INDETERMINATE_DATATYPE: "42P18",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] collation_mismatch */
  COLLATION_MISMATCH: "42P21",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] indeterminate_collation */
  INDETERMINATE_COLLATION: "42P22",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] wrong_object_type */
  WRONG_OBJECT_TYPE: "42809",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] generated_always */
  GENERATED_ALWAYS: "428C9",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] undefined_column */
  UNDEFINED_COLUMN: "42703",
  /** Class 42 - Syntax Error or Access Rule Violation: [E]  */
  UNDEFINED_CURSOR: "34000",
  /** Class 42 - Syntax Error or Access Rule Violation: [E]  */
  UNDEFINED_DATABASE: "3D000",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] undefined_function */
  UNDEFINED_FUNCTION: "42883",
  /** Class 42 - Syntax Error or Access Rule Violation: [E]  */
  UNDEFINED_PSTATEMENT: "26000",
  /** Class 42 - Syntax Error or Access Rule Violation: [E]  */
  UNDEFINED_SCHEMA: "3F000",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] undefined_table */
  UNDEFINED_TABLE: "42P01",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] undefined_parameter */
  UNDEFINED_PARAMETER: "42P02",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] undefined_object */
  UNDEFINED_OBJECT: "42704",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] duplicate_column */
  DUPLICATE_COLUMN: "42701",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] duplicate_cursor */
  DUPLICATE_CURSOR: "42P03",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] duplicate_database */
  DUPLICATE_DATABASE: "42P04",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] duplicate_function */
  DUPLICATE_FUNCTION: "42723",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] duplicate_prepared_statement */
  DUPLICATE_PSTATEMENT: "42P05",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] duplicate_schema */
  DUPLICATE_SCHEMA: "42P06",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] duplicate_table */
  DUPLICATE_TABLE: "42P07",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] duplicate_alias */
  DUPLICATE_ALIAS: "42712",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] duplicate_object */
  DUPLICATE_OBJECT: "42710",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] ambiguous_column */
  AMBIGUOUS_COLUMN: "42702",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] ambiguous_function */
  AMBIGUOUS_FUNCTION: "42725",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] ambiguous_parameter */
  AMBIGUOUS_PARAMETER: "42P08",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] ambiguous_alias */
  AMBIGUOUS_ALIAS: "42P09",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_column_reference */
  INVALID_COLUMN_REFERENCE: "42P10",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_column_definition */
  INVALID_COLUMN_DEFINITION: "42611",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_cursor_definition */
  INVALID_CURSOR_DEFINITION: "42P11",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_database_definition */
  INVALID_DATABASE_DEFINITION: "42P12",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_function_definition */
  INVALID_FUNCTION_DEFINITION: "42P13",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_prepared_statement_definition */
  INVALID_PSTATEMENT_DEFINITION: "42P14",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_schema_definition */
  INVALID_SCHEMA_DEFINITION: "42P15",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_table_definition */
  INVALID_TABLE_DEFINITION: "42P16",
  /** Class 42 - Syntax Error or Access Rule Violation: [E] invalid_object_definition */
  INVALID_OBJECT_DEFINITION: "42P17",
  /** Class 44 - WITH CHECK OPTION Violation: [E] with_check_option_violation */
  WITH_CHECK_OPTION_VIOLATION: "44000",
  /** Class 53 - Insufficient Resources: [E] insufficient_resources */
  INSUFFICIENT_RESOURCES: "53000",
  /** Class 53 - Insufficient Resources: [E] disk_full */
  DISK_FULL: "53100",
  /** Class 53 - Insufficient Resources: [E] out_of_memory */
  OUT_OF_MEMORY: "53200",
  /** Class 53 - Insufficient Resources: [E] too_many_connections */
  TOO_MANY_CONNECTIONS: "53300",
  /** Class 53 - Insufficient Resources: [E] configuration_limit_exceeded */
  CONFIGURATION_LIMIT_EXCEEDED: "53400",
  /** Class 54 - Program Limit Exceeded: [E] program_limit_exceeded */
  PROGRAM_LIMIT_EXCEEDED: "54000",
  /** Class 54 - Program Limit Exceeded: [E] statement_too_complex */
  STATEMENT_TOO_COMPLEX: "54001",
  /** Class 54 - Program Limit Exceeded: [E] too_many_columns */
  TOO_MANY_COLUMNS: "54011",
  /** Class 54 - Program Limit Exceeded: [E] too_many_arguments */
  TOO_MANY_ARGUMENTS: "54023",
  /** Class 55 - Object Not In Prerequisite State: [E] object_not_in_prerequisite_state */
  OBJECT_NOT_IN_PREREQUISITE_STATE: "55000",
  /** Class 55 - Object Not In Prerequisite State: [E] object_in_use */
  OBJECT_IN_USE: "55006",
  /** Class 55 - Object Not In Prerequisite State: [E] cant_change_runtime_param */
  CANT_CHANGE_RUNTIME_PARAM: "55P02",
  /** Class 55 - Object Not In Prerequisite State: [E] lock_not_available */
  LOCK_NOT_AVAILABLE: "55P03",
  /** Class 55 - Object Not In Prerequisite State: [E] unsafe_new_enum_value_usage */
  UNSAFE_NEW_ENUM_VALUE_USAGE: "55P04",
  /** Class 57 - Operator Intervention: [E] operator_intervention */
  OPERATOR_INTERVENTION: "57000",
  /** Class 57 - Operator Intervention: [E] query_canceled */
  QUERY_CANCELED: "57014",
  /** Class 57 - Operator Intervention: [E] admin_shutdown */
  ADMIN_SHUTDOWN: "57P01",
  /** Class 57 - Operator Intervention: [E] crash_shutdown */
  CRASH_SHUTDOWN: "57P02",
  /** Class 57 - Operator Intervention: [E] cannot_connect_now */
  CANNOT_CONNECT_NOW: "57P03",
  /** Class 57 - Operator Intervention: [E] database_dropped */
  DATABASE_DROPPED: "57P04",
  /** Class 57 - Operator Intervention: [E] idle_session_timeout */
  IDLE_SESSION_TIMEOUT: "57P05",
  /** Class 58 - System Error (errors external to PostgreSQL itself): [E] system_error */
  SYSTEM_ERROR: "58000",
  /** Class 58 - System Error (errors external to PostgreSQL itself): [E] io_error */
  IO_ERROR: "58030",
  /** Class 58 - System Error (errors external to PostgreSQL itself): [E] undefined_file */
  UNDEFINED_FILE: "58P01",
  /** Class 58 - System Error (errors external to PostgreSQL itself): [E] duplicate_file */
  DUPLICATE_FILE: "58P02",
  /** Class F0 - Configuration File Error: [E] config_file_error */
  CONFIG_FILE_ERROR: "F0000",
  /** Class F0 - Configuration File Error: [E] lock_file_exists */
  LOCK_FILE_EXISTS: "F0001",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_error */
  FDW_ERROR: "HV000",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_column_name_not_found */
  FDW_COLUMN_NAME_NOT_FOUND: "HV005",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_dynamic_parameter_value_needed */
  FDW_DYNAMIC_PARAMETER_VALUE_NEEDED: "HV002",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_function_sequence_error */
  FDW_FUNCTION_SEQUENCE_ERROR: "HV010",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_inconsistent_descriptor_information */
  FDW_INCONSISTENT_DESCRIPTOR_INFORMATION: "HV021",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_attribute_value */
  FDW_INVALID_ATTRIBUTE_VALUE: "HV024",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_column_name */
  FDW_INVALID_COLUMN_NAME: "HV007",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_column_number */
  FDW_INVALID_COLUMN_NUMBER: "HV008",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_data_type */
  FDW_INVALID_DATA_TYPE: "HV004",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_data_type_descriptors */
  FDW_INVALID_DATA_TYPE_DESCRIPTORS: "HV006",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_descriptor_field_identifier */
  FDW_INVALID_DESCRIPTOR_FIELD_IDENTIFIER: "HV091",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_handle */
  FDW_INVALID_HANDLE: "HV00B",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_option_index */
  FDW_INVALID_OPTION_INDEX: "HV00C",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_option_name */
  FDW_INVALID_OPTION_NAME: "HV00D",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_string_length_or_buffer_length */
  FDW_INVALID_STRING_LENGTH_OR_BUFFER_LENGTH: "HV090",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_string_format */
  FDW_INVALID_STRING_FORMAT: "HV00A",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_invalid_use_of_null_pointer */
  FDW_INVALID_USE_OF_NULL_POINTER: "HV009",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_too_many_handles */
  FDW_TOO_MANY_HANDLES: "HV014",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_out_of_memory */
  FDW_OUT_OF_MEMORY: "HV001",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_no_schemas */
  FDW_NO_SCHEMAS: "HV00P",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_option_name_not_found */
  FDW_OPTION_NAME_NOT_FOUND: "HV00J",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_reply_handle */
  FDW_REPLY_HANDLE: "HV00K",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_schema_not_found */
  FDW_SCHEMA_NOT_FOUND: "HV00Q",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_table_not_found */
  FDW_TABLE_NOT_FOUND: "HV00R",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_unable_to_create_execution */
  FDW_UNABLE_TO_CREATE_EXECUTION: "HV00L",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_unable_to_create_reply */
  FDW_UNABLE_TO_CREATE_REPLY: "HV00M",
  /** Class HV - Foreign Data Wrapper Error (SQL/MED): [E] fdw_unable_to_establish_connection */
  FDW_UNABLE_TO_ESTABLISH_CONNECTION: "HV00N",
  /** Class P0 - PL/pgSQL Error: [E] plpgsql_error */
  PLPGSQL_ERROR: "P0000",
  /** Class P0 - PL/pgSQL Error: [E] raise_exception */
  RAISE_EXCEPTION: "P0001",
  /** Class P0 - PL/pgSQL Error: [E] no_data_found */
  NO_DATA_FOUND: "P0002",
  /** Class P0 - PL/pgSQL Error: [E] too_many_rows */
  TOO_MANY_ROWS: "P0003",
  /** Class P0 - PL/pgSQL Error: [E] assert_failure */
  ASSERT_FAILURE: "P0004",
  /** Class XX - Internal Error: [E] internal_error */
  INTERNAL_ERROR: "XX000",
  /** Class XX - Internal Error: [E] data_corrupted */
  DATA_CORRUPTED: "XX001",
  /** Class XX - Internal Error: [E] index_corrupted */
  INDEX_CORRUPTED: "XX002",
  UNKNOWN: "UNKNOWN",
} as const;

export type Pair = readonly [
  key: keyof typeof PostgresErrorEnum,
  value: (typeof PostgresErrorEnum)[keyof typeof PostgresErrorEnum],
];
export type PairArray = A.NonEmptyReadonlyArray<Pair>;
export const pgErrorEntries = pipe(PostgresErrorEnum, Struct.entries, (entries): PairArray => {
  invariant(A.isNonEmptyReadonlyArray(entries), "must be non empty array", {
    file: "@beep/shared-server/internal/db/Database/pg-error-enum.ts",
    line: 544,
    args: entries,
  });

  return entries;
});

export class PgErrorCodeFromKey extends BS.MappedLiteralKit(...pgErrorEntries).annotations(
  $I.annotations("PgErrorCodeFromKey", {
    description: "A pg error code mapped literal kit",
  })
) {
  static readonly Enum = PostgresErrorEnum;
  static readonly EnumReverse = reverseRecord(PostgresErrorEnum);
}
