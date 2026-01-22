CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."organization_type_enum" AS ENUM('individual', 'team', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscription_status_enum" AS ENUM('active', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier_enum" AS ENUM('free', 'plus', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."text_style_enum" AS ENUM('default', 'serif', 'mono');--> statement-breakpoint
CREATE TYPE "public"."device_code_status_enum" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TYPE "public"."invitation_status_enum" AS ENUM('pending', 'rejected', 'cancelled', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."member_role_enum" AS ENUM('admin', 'member', 'owner');--> statement-breakpoint
CREATE TYPE "public"."member_status_enum" AS ENUM('active', 'inactive', 'offline', 'suspended', 'deleted', 'invited');--> statement-breakpoint
CREATE TABLE "calendar_calendar_event" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "calendar_calendar_event_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "comms_email_template" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"subject" text,
	"body" text,
	"to" jsonb,
	"cc" jsonb,
	"bcc" jsonb,
	CONSTRAINT "comms_email_template_id_unique" UNIQUE("id"),
	CONSTRAINT "uidx_email_template_org_id_user_id_name_unique" UNIQUE("organization_id","user_id","name")
);
--> statement-breakpoint
ALTER TABLE "comms_email_template" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shared_organization" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"type" "organization_type_enum" DEFAULT 'individual' NOT NULL,
	"owner_user_id" text NOT NULL,
	"is_personal" boolean DEFAULT false NOT NULL,
	"max_members" integer,
	"features" jsonb,
	"settings" jsonb,
	"subscription_tier" "subscription_tier_enum" DEFAULT 'free' NOT NULL,
	"subscription_status" "subscription_status_enum" DEFAULT 'active' NOT NULL,
	CONSTRAINT "shared_organization_id_unique" UNIQUE("id"),
	CONSTRAINT "shared_organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "shared_team" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"name" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"metadata" text,
	"logo" text,
	CONSTRAINT "shared_team_id_unique" UNIQUE("id"),
	CONSTRAINT "shared_team_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "shared_team" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shared_user" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"upload_limit" integer DEFAULT 100000000 NOT NULL,
	"image" text,
	"role" "user_role_enum" DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"phone_number" text,
	"phone_number_verified" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"username" text,
	"display_username" text,
	"stripe_customer_id" text,
	"last_login_method" text,
	CONSTRAINT "shared_user_id_unique" UNIQUE("id"),
	CONSTRAINT "shared_user_email_unique" UNIQUE("email"),
	CONSTRAINT "shared_user_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "shared_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "customization_user_hotkey" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"user_id" text NOT NULL,
	"shortcuts" jsonb NOT NULL,
	CONSTRAINT "customization_user_hotkey_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "documents_comment" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"discussion_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"content_rich" jsonb,
	"is_edited" boolean DEFAULT false NOT NULL,
	CONSTRAINT "documents_comment_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "documents_comment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "documents_discussion" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"document_id" text NOT NULL,
	"user_id" text NOT NULL,
	"document_content" text NOT NULL,
	"document_content_rich" jsonb,
	"is_resolved" boolean DEFAULT false NOT NULL,
	CONSTRAINT "documents_discussion_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "documents_discussion" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "documents_document" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"user_id" text NOT NULL,
	"template_id" text,
	"parent_document_id" text,
	"title" text,
	"content" text,
	"content_rich" jsonb,
	"yjs_snapshot" "bytea",
	"cover_image" text,
	"icon" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"text_style" text_style_enum DEFAULT 'default' NOT NULL,
	"small_text" boolean DEFAULT false NOT NULL,
	"full_width" boolean DEFAULT false NOT NULL,
	"lock_page" boolean DEFAULT false NOT NULL,
	"toc" boolean DEFAULT true NOT NULL,
	CONSTRAINT "documents_document_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "documents_document" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "documents_document_file" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"user_id" text NOT NULL,
	"document_id" text,
	"size" integer NOT NULL,
	"url" text NOT NULL,
	"app_url" text NOT NULL,
	"type" text NOT NULL,
	CONSTRAINT "documents_document_file_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "documents_document_file" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "documents_document_version" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"document_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"content_rich" jsonb,
	CONSTRAINT "documents_document_version_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "documents_document_version" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shared_file" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"key" text NOT NULL,
	"url" text NOT NULL,
	"name" text NOT NULL,
	"size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"user_id" text NOT NULL,
	"folder_id" text NOT NULL,
	"uploaded_by_user_id" text NOT NULL,
	"metadata" text NOT NULL,
	CONSTRAINT "shared_file_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "shared_file" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shared_session" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text NOT NULL,
	"active_team_id" text,
	CONSTRAINT "shared_session_id_unique" UNIQUE("id"),
	CONSTRAINT "shared_session_token_unique" UNIQUE("token"),
	CONSTRAINT "session_expires_after_created_check" CHECK ("shared_session"."expires_at" > "shared_session"."created_at")
);
--> statement-breakpoint
CREATE TABLE "iam_account" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	CONSTRAINT "iam_account_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "iam_apikey" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp with time zone,
	"enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_time_window" integer DEFAULT 86400000 NOT NULL,
	"rate_limit_max" integer DEFAULT 10 NOT NULL,
	"request_count" integer,
	"remaining" integer,
	"last_request" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"permissions" text,
	"metadata" text,
	CONSTRAINT "iam_apikey_id_unique" UNIQUE("id"),
	CONSTRAINT "apikey_request_count_non_negative_check" CHECK ("iam_apikey"."request_count" IS NULL OR "iam_apikey"."request_count" >= 0),
	CONSTRAINT "apikey_refill_amount_non_negative_check" CHECK ("iam_apikey"."refill_amount" IS NULL OR "iam_apikey"."refill_amount" >= 0),
	CONSTRAINT "apikey_rate_limit_time_window_positive_check" CHECK ("iam_apikey"."rate_limit_time_window" IS NULL OR "iam_apikey"."rate_limit_time_window" > 0),
	CONSTRAINT "apikey_rate_limit_max_positive_check" CHECK ("iam_apikey"."rate_limit_max" IS NULL OR "iam_apikey"."rate_limit_max" > 0),
	CONSTRAINT "apikey_remaining_non_negative_check" CHECK ("iam_apikey"."remaining" IS NULL OR "iam_apikey"."remaining" >= 0)
);
--> statement-breakpoint
ALTER TABLE "iam_apikey" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "iam_device_code" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"device_code" text NOT NULL,
	"user_code" text NOT NULL,
	"user_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "device_code_status_enum" DEFAULT 'pending' NOT NULL,
	"last_polled_at" timestamp with time zone,
	"polling_interval" integer,
	"client_id" text,
	"scope" text,
	CONSTRAINT "iam_device_code_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "iam_invitation" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"email" text NOT NULL,
	"role" text,
	"team_id" text,
	"status" "invitation_status_enum" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"inviter_id" text NOT NULL,
	"organization_id" text,
	CONSTRAINT "iam_invitation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "iam_jwks" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "iam_jwks_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "iam_member" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"user_id" text NOT NULL,
	"role" "member_role_enum" DEFAULT 'member' NOT NULL,
	"status" "member_status_enum" DEFAULT 'active' NOT NULL,
	"invited_by" text,
	"invited_at" timestamp with time zone,
	"joined_at" timestamp with time zone,
	"last_active_at" timestamp with time zone,
	"permissions" text,
	CONSTRAINT "iam_member_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "iam_member" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "iam_oauth_access_token" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"token" text,
	"client_id" text NOT NULL,
	"session_id" text,
	"user_id" text,
	"reference_id" text,
	"refresh_id" text,
	"expires_at" timestamp with time zone,
	"scopes" text[] NOT NULL,
	CONSTRAINT "iam_oauth_access_token_id_unique" UNIQUE("id"),
	CONSTRAINT "iam_oauth_access_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "iam_oauth_client" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"client_id" text NOT NULL,
	"client_secret" text,
	"disabled" boolean DEFAULT false NOT NULL,
	"skip_consent" boolean,
	"enable_end_session" boolean,
	"scopes" text[],
	"user_id" text,
	"name" text,
	"uri" text,
	"icon" text,
	"contacts" text[],
	"tos" text,
	"policy" text,
	"software_id" text,
	"software_version" text,
	"software_statement" text,
	"redirect_uris" text[] NOT NULL,
	"post_logout_redirect_uris" text[],
	"token_endpoint_auth_method" text,
	"grant_types" text[],
	"response_types" text[],
	"public" boolean,
	"type" text,
	"reference_id" text,
	"metadata" jsonb,
	CONSTRAINT "iam_oauth_client_id_unique" UNIQUE("id"),
	CONSTRAINT "iam_oauth_client_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "iam_oauth_consent" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"client_id" text NOT NULL,
	"user_id" text,
	"reference_id" text,
	"scopes" text[] NOT NULL,
	CONSTRAINT "iam_oauth_consent_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "iam_oauth_refresh_token" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"token" text NOT NULL,
	"client_id" text NOT NULL,
	"session_id" text,
	"user_id" text NOT NULL,
	"reference_id" text,
	"expires_at" timestamp with time zone,
	"revoked" timestamp with time zone,
	"scopes" text[] NOT NULL,
	CONSTRAINT "iam_oauth_refresh_token_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "iam_organization_role" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"role" text NOT NULL,
	"permission" text NOT NULL,
	CONSTRAINT "iam_organization_role_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "iam_organization_role" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "iam_passkey" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"name" text NOT NULL,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_i_d" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean DEFAULT false NOT NULL,
	"transports" text,
	"aaguid" text,
	CONSTRAINT "iam_passkey_id_unique" UNIQUE("id"),
	CONSTRAINT "passkey_counter_non_negative_check" CHECK ("iam_passkey"."counter" >= 0)
);
--> statement-breakpoint
CREATE TABLE "iam_rate_limit" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"key" text,
	"count" integer,
	"last_request" bigint,
	CONSTRAINT "iam_rate_limit_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "iam_scim_provider" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"provider_id" text NOT NULL,
	"scim_token" text NOT NULL,
	"organization_id" text,
	CONSTRAINT "iam_scim_provider_id_unique" UNIQUE("id"),
	CONSTRAINT "iam_scim_provider_provider_id_unique" UNIQUE("provider_id"),
	CONSTRAINT "iam_scim_provider_scim_token_unique" UNIQUE("scim_token")
);
--> statement-breakpoint
CREATE TABLE "iam_sso_provider" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"issuer" text NOT NULL,
	"oidc_config" text,
	"saml_config" text,
	"user_id" text,
	"provider_id" text NOT NULL,
	"organization_id" text,
	"domain" text NOT NULL,
	CONSTRAINT "iam_sso_provider_id_unique" UNIQUE("id"),
	CONSTRAINT "iam_sso_provider_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
CREATE TABLE "iam_subscription" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"plan" text NOT NULL,
	"reference_id" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status" text DEFAULT 'incomplete' NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"seats" integer,
	CONSTRAINT "iam_subscription_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "iam_subscription" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "iam_team_member" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "iam_team_member_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "iam_team_member" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "iam_two_factor" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "iam_two_factor_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "iam_two_factor" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "iam_verification" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "iam_verification_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "iam_wallet_address" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"user_id" text NOT NULL,
	"address" text NOT NULL,
	"chain_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "iam_wallet_address_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_class_definition" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"ontology_id" text NOT NULL,
	"iri" text NOT NULL,
	"label" text NOT NULL,
	"comment" text,
	"local_name" text,
	"properties" jsonb,
	"pref_labels" jsonb,
	"alt_labels" jsonb,
	"hidden_labels" jsonb,
	"definition" text,
	"scope_note" text,
	"example" text,
	"broader" jsonb,
	"narrower" jsonb,
	"related" jsonb,
	"equivalent_class" jsonb,
	"exact_match" jsonb,
	"close_match" jsonb,
	CONSTRAINT "knowledge_class_definition_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_class_definition" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_embedding" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"ontology_id" text DEFAULT 'default' NOT NULL,
	"embedding" vector(768) NOT NULL,
	"content_text" text,
	"model" text DEFAULT 'nomic-embed-text-v1.5' NOT NULL,
	CONSTRAINT "knowledge_embedding_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_embedding" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_entity" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"mention" text NOT NULL,
	"types" jsonb NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ontology_id" text DEFAULT 'default' NOT NULL,
	"document_id" text,
	"source_uri" text,
	"extraction_id" text,
	"grounding_confidence" real,
	"mentions" jsonb,
	CONSTRAINT "knowledge_entity_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_entity" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_entity_cluster" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"canonical_entity_id" text NOT NULL,
	"member_ids" jsonb NOT NULL,
	"cohesion" real NOT NULL,
	"shared_types" jsonb NOT NULL,
	"ontology_id" text NOT NULL,
	CONSTRAINT "knowledge_entity_cluster_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_entity_cluster" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_extraction" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"document_id" text NOT NULL,
	"source_uri" text,
	"ontology_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"entity_count" integer,
	"relation_count" integer,
	"chunk_count" integer,
	"total_tokens" integer,
	"error_message" text,
	"config" jsonb,
	CONSTRAINT "knowledge_extraction_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_extraction" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_mention" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"entity_id" text NOT NULL,
	"text" text NOT NULL,
	"start_char" integer NOT NULL,
	"end_char" integer NOT NULL,
	"document_id" text NOT NULL,
	"chunk_index" integer,
	"extraction_id" text,
	"confidence" real,
	"is_primary" boolean DEFAULT false NOT NULL,
	"context" text,
	CONSTRAINT "knowledge_mention_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_mention" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_ontology" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"name" text NOT NULL,
	"namespace" text NOT NULL,
	"ontology_version" text DEFAULT '1.0.0' NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"format" text DEFAULT 'turtle' NOT NULL,
	"content_hash" text,
	"storage_path" text,
	"class_count" integer,
	"property_count" integer,
	"metadata" jsonb,
	CONSTRAINT "knowledge_ontology_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_ontology" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_property_definition" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"ontology_id" text NOT NULL,
	"iri" text NOT NULL,
	"label" text NOT NULL,
	"comment" text,
	"local_name" text,
	"domain" jsonb,
	"range" jsonb,
	"range_type" text DEFAULT 'object' NOT NULL,
	"is_functional" boolean DEFAULT false NOT NULL,
	"inverse_of" jsonb,
	"pref_labels" jsonb,
	"alt_labels" jsonb,
	"hidden_labels" jsonb,
	"definition" text,
	"scope_note" text,
	"example" text,
	"broader" jsonb,
	"narrower" jsonb,
	"related" jsonb,
	"exact_match" jsonb,
	"close_match" jsonb,
	CONSTRAINT "knowledge_property_definition_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_property_definition" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_relation" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"subject_id" text NOT NULL,
	"predicate" text NOT NULL,
	"object_id" text,
	"literal_value" text,
	"literal_type" text,
	"ontology_id" text DEFAULT 'default' NOT NULL,
	"extraction_id" text,
	"evidence" jsonb,
	"grounding_confidence" real,
	CONSTRAINT "knowledge_relation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_relation" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_same_as_link" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"canonical_id" text NOT NULL,
	"member_id" text NOT NULL,
	"confidence" real NOT NULL,
	"source_id" text,
	CONSTRAINT "knowledge_same_as_link_id_unique" UNIQUE("id"),
	CONSTRAINT "same_as_unique" UNIQUE("canonical_id","member_id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_same_as_link" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shared_folder" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "shared_folder_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "shared_folder" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shared_upload_session" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"file_key" text NOT NULL,
	"signature" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "shared_upload_session_id_unique" UNIQUE("id"),
	CONSTRAINT "shared_upload_session_file_key_unique" UNIQUE("file_key")
);
--> statement-breakpoint
ALTER TABLE "shared_upload_session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "comms_email_template" ADD CONSTRAINT "comms_email_template_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comms_email_template" ADD CONSTRAINT "comms_email_template_user_id_shared_user__row_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("_row_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_organization" ADD CONSTRAINT "shared_organization_owner_user_id_shared_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_team" ADD CONSTRAINT "shared_team_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customization_user_hotkey" ADD CONSTRAINT "customization_user_hotkey_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_comment" ADD CONSTRAINT "documents_comment_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "documents_comment" ADD CONSTRAINT "documents_comment_discussion_id_documents_discussion_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."documents_discussion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_comment" ADD CONSTRAINT "documents_comment_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_discussion" ADD CONSTRAINT "documents_discussion_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "documents_discussion" ADD CONSTRAINT "documents_discussion_document_id_documents_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents_document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_discussion" ADD CONSTRAINT "documents_discussion_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_document" ADD CONSTRAINT "documents_document_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "documents_document" ADD CONSTRAINT "documents_document_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_document_file" ADD CONSTRAINT "documents_document_file_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "documents_document_file" ADD CONSTRAINT "documents_document_file_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_document_file" ADD CONSTRAINT "documents_document_file_document_id_documents_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents_document"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_document_version" ADD CONSTRAINT "documents_document_version_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "documents_document_version" ADD CONSTRAINT "documents_document_version_document_id_documents_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents_document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_document_version" ADD CONSTRAINT "documents_document_version_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_file" ADD CONSTRAINT "shared_file_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_file" ADD CONSTRAINT "shared_file_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_file" ADD CONSTRAINT "shared_file_folder_id_shared_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."shared_folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_file" ADD CONSTRAINT "shared_file_uploaded_by_user_id_shared_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_session" ADD CONSTRAINT "shared_session_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_session" ADD CONSTRAINT "shared_session_impersonated_by_shared_user_id_fk" FOREIGN KEY ("impersonated_by") REFERENCES "public"."shared_user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_session" ADD CONSTRAINT "shared_session_active_organization_id_shared_organization_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_session" ADD CONSTRAINT "shared_session_active_team_id_shared_team_id_fk" FOREIGN KEY ("active_team_id") REFERENCES "public"."shared_team"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_account" ADD CONSTRAINT "iam_account_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_apikey" ADD CONSTRAINT "iam_apikey_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_apikey" ADD CONSTRAINT "iam_apikey_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_device_code" ADD CONSTRAINT "iam_device_code_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_invitation" ADD CONSTRAINT "iam_invitation_team_id_shared_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."shared_team"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_invitation" ADD CONSTRAINT "iam_invitation_inviter_id_shared_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_invitation" ADD CONSTRAINT "iam_invitation_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_member" ADD CONSTRAINT "iam_member_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_member" ADD CONSTRAINT "iam_member_invited_by_shared_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."shared_user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_oauth_access_token" ADD CONSTRAINT "iam_oauth_access_token_client_id_iam_oauth_client_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."iam_oauth_client"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_oauth_access_token" ADD CONSTRAINT "iam_oauth_access_token_session_id_shared_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."shared_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_oauth_access_token" ADD CONSTRAINT "iam_oauth_access_token_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_oauth_access_token" ADD CONSTRAINT "iam_oauth_access_token_refresh_id_iam_oauth_refresh_token_id_fk" FOREIGN KEY ("refresh_id") REFERENCES "public"."iam_oauth_refresh_token"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_oauth_client" ADD CONSTRAINT "iam_oauth_client_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_oauth_consent" ADD CONSTRAINT "iam_oauth_consent_client_id_iam_oauth_client_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."iam_oauth_client"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_oauth_consent" ADD CONSTRAINT "iam_oauth_consent_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_oauth_refresh_token" ADD CONSTRAINT "iam_oauth_refresh_token_client_id_iam_oauth_client_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."iam_oauth_client"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_oauth_refresh_token" ADD CONSTRAINT "iam_oauth_refresh_token_session_id_shared_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."shared_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_oauth_refresh_token" ADD CONSTRAINT "iam_oauth_refresh_token_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_organization_role" ADD CONSTRAINT "iam_organization_role_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_passkey" ADD CONSTRAINT "iam_passkey_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_scim_provider" ADD CONSTRAINT "iam_scim_provider_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_sso_provider" ADD CONSTRAINT "iam_sso_provider_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_sso_provider" ADD CONSTRAINT "iam_sso_provider_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_subscription" ADD CONSTRAINT "iam_subscription_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_team_member" ADD CONSTRAINT "iam_team_member_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_team_member" ADD CONSTRAINT "iam_team_member_team_id_shared_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."shared_team"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_team_member" ADD CONSTRAINT "iam_team_member_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_two_factor" ADD CONSTRAINT "iam_two_factor_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam_two_factor" ADD CONSTRAINT "iam_two_factor_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam_wallet_address" ADD CONSTRAINT "iam_wallet_address_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_class_definition" ADD CONSTRAINT "knowledge_class_definition_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_class_definition" ADD CONSTRAINT "knowledge_class_definition_ontology_id_knowledge_ontology_id_fk" FOREIGN KEY ("ontology_id") REFERENCES "public"."knowledge_ontology"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_embedding" ADD CONSTRAINT "knowledge_embedding_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_entity" ADD CONSTRAINT "knowledge_entity_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_entity_cluster" ADD CONSTRAINT "knowledge_entity_cluster_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_entity_cluster" ADD CONSTRAINT "knowledge_entity_cluster_canonical_entity_id_knowledge_entity_id_fk" FOREIGN KEY ("canonical_entity_id") REFERENCES "public"."knowledge_entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_extraction" ADD CONSTRAINT "knowledge_extraction_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_mention" ADD CONSTRAINT "knowledge_mention_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_ontology" ADD CONSTRAINT "knowledge_ontology_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_property_definition" ADD CONSTRAINT "knowledge_property_definition_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_property_definition" ADD CONSTRAINT "knowledge_property_definition_ontology_id_knowledge_ontology_id_fk" FOREIGN KEY ("ontology_id") REFERENCES "public"."knowledge_ontology"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_relation" ADD CONSTRAINT "knowledge_relation_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_same_as_link" ADD CONSTRAINT "knowledge_same_as_link_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_same_as_link" ADD CONSTRAINT "knowledge_same_as_link_canonical_id_knowledge_entity_id_fk" FOREIGN KEY ("canonical_id") REFERENCES "public"."knowledge_entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_same_as_link" ADD CONSTRAINT "knowledge_same_as_link_member_id_knowledge_entity_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."knowledge_entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_folder" ADD CONSTRAINT "shared_folder_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_folder" ADD CONSTRAINT "shared_folder_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_upload_session" ADD CONSTRAINT "shared_upload_session_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "calendar_calendarEvent_name_idx" ON "calendar_calendar_event" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_email_template_user_id" ON "comms_email_template" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_org_id" ON "comms_email_template" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_name_idx" ON "shared_organization" USING btree ("name");--> statement-breakpoint
CREATE INDEX "organization_slug_idx" ON "shared_organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organization_type_idx" ON "shared_organization" USING btree ("type");--> statement-breakpoint
CREATE INDEX "organization_owner_idx" ON "shared_organization" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "organization_personal_idx" ON "shared_organization" USING btree ("is_personal") WHERE "shared_organization"."is_personal" = true;--> statement-breakpoint
CREATE INDEX "organization_subscription_idx" ON "shared_organization" USING btree ("subscription_tier","subscription_status");--> statement-breakpoint
CREATE INDEX "team_organization_id_idx" ON "shared_team" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_org_name_unique_idx" ON "shared_team" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "team_name_idx" ON "shared_team" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "shared_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_active_idx" ON "shared_user" USING btree ("id","email_verified") WHERE "shared_user"."banned" IS NOT TRUE AND "shared_user"."email_verified" = true;--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "shared_user" USING btree ("role") WHERE "shared_user"."role" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "user_banned_expires_idx" ON "shared_user" USING btree ("ban_expires") WHERE "shared_user"."banned" = true AND "shared_user"."ban_expires" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "user_2fa_enabled_idx" ON "shared_user" USING btree ("two_factor_enabled") WHERE "shared_user"."two_factor_enabled" = true;--> statement-breakpoint
CREATE INDEX "user_hotkeys_shortcuts_idx" ON "customization_user_hotkey" USING btree ("shortcuts");--> statement-breakpoint
CREATE INDEX "comment_organization_id_idx" ON "documents_comment" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "comment_discussion_idx" ON "documents_comment" USING btree ("discussion_id");--> statement-breakpoint
CREATE INDEX "comment_user_idx" ON "documents_comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discussion_org_id_idx" ON "documents_discussion" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "discussion_document_idx" ON "documents_discussion" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "discussion_user_idx" ON "documents_discussion" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discussion_is_resolved_idx" ON "documents_discussion" USING btree ("is_resolved");--> statement-breakpoint
CREATE INDEX "document_organization_id_idx" ON "documents_document" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_user_template_idx" ON "documents_document" USING btree ("user_id","template_id");--> statement-breakpoint
CREATE INDEX "document_user_idx" ON "documents_document" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_parent_idx" ON "documents_document" USING btree ("parent_document_id");--> statement-breakpoint
CREATE INDEX "document_is_published_idx" ON "documents_document" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "document_is_archived_idx" ON "documents_document" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "document_search_idx" ON "documents_document" USING gin ((
        setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("content", '')), 'B')
      ));--> statement-breakpoint
CREATE INDEX "document_file_org_id_idx" ON "documents_document_file" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "document_file_user_idx" ON "documents_document_file" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_file_document_idx" ON "documents_document_file" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_file_type_idx" ON "documents_document_file" USING btree ("type");--> statement-breakpoint
CREATE INDEX "document_version_org_id_idx" ON "documents_document_version" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "document_version_document_idx" ON "documents_document_version" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_version_user_idx" ON "documents_document_version" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "file_organization_id_idx" ON "shared_file" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "shared_session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "shared_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "shared_session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "session_user_expires_idx" ON "shared_session" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "session_active_org_idx" ON "shared_session" USING btree ("active_organization_id");--> statement-breakpoint
CREATE INDEX "session_active_team_idx" ON "shared_session" USING btree ("active_team_id");--> statement-breakpoint
CREATE INDEX "session_impersonated_by_idx" ON "shared_session" USING btree ("impersonated_by");--> statement-breakpoint
CREATE INDEX "session_user_org_active_idx" ON "shared_session" USING btree ("user_id","active_organization_id","expires_at");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "iam_account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_unique_idx" ON "iam_account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "account_provider_id_idx" ON "iam_account" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "account_user_provider_idx" ON "iam_account" USING btree ("user_id","provider_id");--> statement-breakpoint
CREATE INDEX "account_access_token_expires_idx" ON "iam_account" USING btree ("access_token_expires_at") WHERE "iam_account"."access_token_expires_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "account_refresh_token_expires_idx" ON "iam_account" USING btree ("refresh_token_expires_at") WHERE "iam_account"."refresh_token_expires_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "api_key_organization_id_idx" ON "iam_apikey" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_organization_id_idx" ON "iam_invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_inviter_id_idx" ON "iam_invitation" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "iam_invitation" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "invitation_org_email_unique_idx" ON "iam_invitation" USING btree ("organization_id","email") WHERE "iam_invitation"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "invitation_status_idx" ON "iam_invitation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invitation_expires_at_idx" ON "iam_invitation" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invitation_pending_idx" ON "iam_invitation" USING btree ("organization_id","status","expires_at") WHERE "iam_invitation"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "invitation_team_id_idx" ON "iam_invitation" USING btree ("team_id") WHERE "iam_invitation"."team_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "member_organization_id_idx" ON "iam_member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_user_id_idx" ON "iam_member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_org_user_unique_idx" ON "iam_member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "member_org_role_idx" ON "iam_member" USING btree ("organization_id","role");--> statement-breakpoint
CREATE INDEX "member_role_idx" ON "iam_member" USING btree ("role");--> statement-breakpoint
CREATE INDEX "member_status_idx" ON "iam_member" USING btree ("status");--> statement-breakpoint
CREATE INDEX "member_org_status_idx" ON "iam_member" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "member_invited_by_idx" ON "iam_member" USING btree ("invited_by");--> statement-breakpoint
CREATE INDEX "member_last_active_idx" ON "iam_member" USING btree ("last_active_at");--> statement-breakpoint
CREATE INDEX "oauth_access_token_client_id_idx" ON "iam_oauth_access_token" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "oauth_access_token_user_id_idx" ON "iam_oauth_access_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_access_token_session_id_idx" ON "iam_oauth_access_token" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_client_client_id_uidx" ON "iam_oauth_client" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "oauth_client_user_id_idx" ON "iam_oauth_client" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_consent_client_id_idx" ON "iam_oauth_consent" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "oauth_consent_user_id_idx" ON "iam_oauth_consent" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_consent_client_user_uidx" ON "iam_oauth_consent" USING btree ("client_id","user_id");--> statement-breakpoint
CREATE INDEX "oauth_refresh_token_client_id_idx" ON "iam_oauth_refresh_token" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "oauth_refresh_token_user_id_idx" ON "iam_oauth_refresh_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_refresh_token_session_id_idx" ON "iam_oauth_refresh_token" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "organization_role_org_id_idx" ON "iam_organization_role" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "scim_provider_org_id_idx" ON "iam_scim_provider" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sso_provider_org_id_idx" ON "iam_sso_provider" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "subscription_organization_id_idx" ON "iam_subscription" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "team_member_organization_id_idx" ON "iam_team_member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "team_member_team_id_idx" ON "iam_team_member" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_member_user_id_idx" ON "iam_team_member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_member_team_user_unique_idx" ON "iam_team_member" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "team_member_team_user_idx" ON "iam_team_member" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "two_factor_organization_id_idx" ON "iam_two_factor" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "iam_verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_identifier_value_idx" ON "iam_verification" USING btree ("identifier","value");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "iam_verification" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verification_active_idx" ON "iam_verification" USING btree ("identifier","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_address_user_chain_id_unique_idx" ON "iam_wallet_address" USING btree ("user_id","address","chain_id");--> statement-breakpoint
CREATE INDEX "class_definition_organization_id_idx" ON "knowledge_class_definition" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "class_definition_ontology_id_idx" ON "knowledge_class_definition" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "class_definition_iri_idx" ON "knowledge_class_definition" USING btree ("iri");--> statement-breakpoint
CREATE INDEX "class_definition_label_idx" ON "knowledge_class_definition" USING btree ("label");--> statement-breakpoint
CREATE UNIQUE INDEX "class_definition_ontology_iri_idx" ON "knowledge_class_definition" USING btree ("ontology_id","iri");--> statement-breakpoint
CREATE INDEX "embedding_organization_id_idx" ON "knowledge_embedding" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "entity_organization_id_idx" ON "knowledge_entity" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "entity_ontology_id_idx" ON "knowledge_entity" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "entity_document_id_idx" ON "knowledge_entity" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "entity_extraction_id_idx" ON "knowledge_entity" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "entity_cluster_canonical_idx" ON "knowledge_entity_cluster" USING btree ("canonical_entity_id");--> statement-breakpoint
CREATE INDEX "entity_cluster_org_idx" ON "knowledge_entity_cluster" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "entity_cluster_ontology_idx" ON "knowledge_entity_cluster" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "extraction_organization_id_idx" ON "knowledge_extraction" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "extraction_document_id_idx" ON "knowledge_extraction" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "extraction_ontology_id_idx" ON "knowledge_extraction" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "extraction_status_idx" ON "knowledge_extraction" USING btree ("status");--> statement-breakpoint
CREATE INDEX "extraction_status_created_at_idx" ON "knowledge_extraction" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "mention_organization_id_idx" ON "knowledge_mention" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "mention_entity_id_idx" ON "knowledge_mention" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "mention_document_id_idx" ON "knowledge_mention" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "mention_extraction_id_idx" ON "knowledge_mention" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "mention_char_range_idx" ON "knowledge_mention" USING btree ("document_id","start_char","end_char");--> statement-breakpoint
CREATE INDEX "mention_primary_idx" ON "knowledge_mention" USING btree ("entity_id","is_primary");--> statement-breakpoint
CREATE INDEX "ontology_organization_id_idx" ON "knowledge_ontology" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ontology_name_idx" ON "knowledge_ontology" USING btree ("name");--> statement-breakpoint
CREATE INDEX "ontology_namespace_idx" ON "knowledge_ontology" USING btree ("namespace");--> statement-breakpoint
CREATE INDEX "ontology_status_idx" ON "knowledge_ontology" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "ontology_org_namespace_name_version_idx" ON "knowledge_ontology" USING btree ("organization_id","namespace","name","ontology_version");--> statement-breakpoint
CREATE INDEX "property_definition_organization_id_idx" ON "knowledge_property_definition" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "property_definition_ontology_id_idx" ON "knowledge_property_definition" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "property_definition_iri_idx" ON "knowledge_property_definition" USING btree ("iri");--> statement-breakpoint
CREATE INDEX "property_definition_label_idx" ON "knowledge_property_definition" USING btree ("label");--> statement-breakpoint
CREATE INDEX "property_definition_range_type_idx" ON "knowledge_property_definition" USING btree ("range_type");--> statement-breakpoint
CREATE UNIQUE INDEX "property_definition_ontology_iri_idx" ON "knowledge_property_definition" USING btree ("ontology_id","iri");--> statement-breakpoint
CREATE INDEX "relation_organization_id_idx" ON "knowledge_relation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "relation_subject_id_idx" ON "knowledge_relation" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "relation_object_id_idx" ON "knowledge_relation" USING btree ("object_id");--> statement-breakpoint
CREATE INDEX "relation_predicate_idx" ON "knowledge_relation" USING btree ("predicate");--> statement-breakpoint
CREATE INDEX "relation_ontology_id_idx" ON "knowledge_relation" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "relation_extraction_id_idx" ON "knowledge_relation" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "relation_triple_idx" ON "knowledge_relation" USING btree ("subject_id","predicate","object_id");--> statement-breakpoint
CREATE INDEX "same_as_canonical_idx" ON "knowledge_same_as_link" USING btree ("canonical_id");--> statement-breakpoint
CREATE INDEX "same_as_member_idx" ON "knowledge_same_as_link" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "same_as_org_idx" ON "knowledge_same_as_link" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "folder_organization_id_idx" ON "shared_folder" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "folder_user_idx" ON "shared_folder" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "upload_session_org_id_idx" ON "shared_upload_session" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "upload_session_expires_at_idx" ON "shared_upload_session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "upload_session_file_key_idx" ON "shared_upload_session" USING btree ("file_key");--> statement-breakpoint
CREATE POLICY "tenant_isolation_comms_email_template" ON "comms_email_template" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_shared_team" ON "shared_team" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_documents_comment" ON "documents_comment" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_documents_discussion" ON "documents_discussion" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_documents_document" ON "documents_document" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_documents_document_file" ON "documents_document_file" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_documents_document_version" ON "documents_document_version" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_shared_file" ON "shared_file" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_iam_apikey" ON "iam_apikey" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_iam_member" ON "iam_member" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_iam_organization_role" ON "iam_organization_role" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_iam_subscription" ON "iam_subscription" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_iam_team_member" ON "iam_team_member" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_iam_two_factor" ON "iam_two_factor" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_class_definition" ON "knowledge_class_definition" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_embedding" ON "knowledge_embedding" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_entity" ON "knowledge_entity" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_entity_cluster" ON "knowledge_entity_cluster" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_extraction" ON "knowledge_extraction" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_mention" ON "knowledge_mention" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_ontology" ON "knowledge_ontology" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_property_definition" ON "knowledge_property_definition" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_relation" ON "knowledge_relation" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_same_as_link" ON "knowledge_same_as_link" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_shared_folder" ON "shared_folder" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_shared_upload_session" ON "shared_upload_session" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);