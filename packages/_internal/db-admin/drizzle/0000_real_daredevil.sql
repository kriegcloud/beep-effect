CREATE TYPE "public"."organization_type_enum" AS ENUM('individual', 'team', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscription_status_enum" AS ENUM('active', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier_enum" AS ENUM('free', 'plus', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."text_style_enum" AS ENUM('default', 'serif', 'mono');--> statement-breakpoint
CREATE TYPE "public"."block_type_enum" AS ENUM('paragraph', 'heading', 'code', 'image', 'file_embed');--> statement-breakpoint
CREATE TYPE "public"."page_status_enum" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."link_type_enum" AS ENUM('explicit', 'inline-reference', 'block_embed');--> statement-breakpoint
CREATE TYPE "public"."device_code_status_enum" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TYPE "public"."invitation_status_enum" AS ENUM('pending', 'rejected', 'cancelled', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."member_role_enum" AS ENUM('admin', 'member', 'owner');--> statement-breakpoint
CREATE TYPE "public"."member_status_enum" AS ENUM('active', 'inactive', 'offline', 'suspended', 'deleted', 'invited');--> statement-breakpoint
CREATE TABLE "organization" (
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
	CONSTRAINT "organization_id_unique" UNIQUE("id"),
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "team" (
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
	CONSTRAINT "team_id_unique" UNIQUE("id"),
	CONSTRAINT "team_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
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
	"ban_expires" timestamp,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"phone_number" text,
	"phone_number_verified" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"username" text,
	"display_username" text,
	"stripe_customer_id" text,
	"last_login_method" text,
	CONSTRAINT "user_id_unique" UNIQUE("id"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "comment" (
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
	CONSTRAINT "comment_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "discussion" (
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
	CONSTRAINT "discussion_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "document" (
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
	CONSTRAINT "document_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "document_file" (
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
	CONSTRAINT "document_file_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "document_version" (
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
	CONSTRAINT "document_version_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_block" (
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
	"page_id" text NOT NULL,
	"parent_block_id" text,
	"type" "block_type_enum" NOT NULL,
	"order" text NOT NULL,
	"encrypted_content" text NOT NULL,
	"content_hash" text NOT NULL,
	"last_edited_by" text NOT NULL,
	CONSTRAINT "knowledge_block_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_page" (
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
	"space_id" text NOT NULL,
	"parent_page_id" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"status" "page_status_enum" NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"last_edited_at" timestamp with time zone NOT NULL,
	CONSTRAINT "knowledge_page_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_space" (
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
	"team_id" text,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_encrypted" boolean NOT NULL,
	"encryption_key_id" text,
	"default_permissions" jsonb NOT NULL,
	CONSTRAINT "knowledge_space_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "page_link" (
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
	"source_page_id" text NOT NULL,
	"target_page_id" text NOT NULL,
	"link_type" "link_type_enum" NOT NULL,
	"source_block_id" text,
	"context_snippet" text,
	CONSTRAINT "page_link_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "session" (
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
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text NOT NULL,
	"active_team_id" text,
	CONSTRAINT "session_id_unique" UNIQUE("id"),
	CONSTRAINT "session_token_unique" UNIQUE("token"),
	CONSTRAINT "session_expires_after_created_check" CHECK ("session"."expires_at" > "session"."created_at")
);
--> statement-breakpoint
CREATE TABLE "account" (
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
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	CONSTRAINT "account_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "apikey" (
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
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_time_window" integer DEFAULT 86400000 NOT NULL,
	"rate_limit_max" integer DEFAULT 10 NOT NULL,
	"request_count" integer,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"permissions" text,
	"metadata" text,
	CONSTRAINT "apikey_id_unique" UNIQUE("id"),
	CONSTRAINT "apikey_request_count_non_negative_check" CHECK ("apikey"."request_count" IS NULL OR "apikey"."request_count" >= 0),
	CONSTRAINT "apikey_refill_amount_non_negative_check" CHECK ("apikey"."refill_amount" IS NULL OR "apikey"."refill_amount" >= 0),
	CONSTRAINT "apikey_rate_limit_time_window_positive_check" CHECK ("apikey"."rate_limit_time_window" IS NULL OR "apikey"."rate_limit_time_window" > 0),
	CONSTRAINT "apikey_rate_limit_max_positive_check" CHECK ("apikey"."rate_limit_max" IS NULL OR "apikey"."rate_limit_max" > 0),
	CONSTRAINT "apikey_remaining_non_negative_check" CHECK ("apikey"."remaining" IS NULL OR "apikey"."remaining" >= 0)
);
--> statement-breakpoint
CREATE TABLE "device_code" (
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
	"expires_at" timestamp NOT NULL,
	"status" "device_code_status_enum" DEFAULT 'pending' NOT NULL,
	"last_polled_at" timestamp,
	"polling_interval" integer,
	"client_id" text,
	"scope" text,
	CONSTRAINT "device_code_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "invitation" (
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
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL,
	"organization_id" text,
	CONSTRAINT "invitation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "jwks" (
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
	"expires_at" timestamp,
	CONSTRAINT "jwks_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "member" (
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
	CONSTRAINT "member_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "oauth_access_token" (
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
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"client_id" text,
	"user_id" text,
	"scopes" text,
	CONSTRAINT "oauth_access_token_id_unique" UNIQUE("id"),
	CONSTRAINT "oauth_access_token_access_token_unique" UNIQUE("access_token"),
	CONSTRAINT "oauth_access_token_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "oauth_application" (
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
	"icon" text,
	"metadata" text,
	"client_id" text,
	"client_secret" text,
	"redirect_u_r_ls" text,
	"type" text,
	"disabled" boolean DEFAULT false NOT NULL,
	"user_id" text,
	CONSTRAINT "oauth_application_id_unique" UNIQUE("id"),
	CONSTRAINT "oauth_application_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "oauth_consent" (
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
	"client_id" text NOT NULL,
	"user_id" text,
	"scopes" text NOT NULL,
	"consent_given" boolean DEFAULT false NOT NULL,
	CONSTRAINT "oauth_consent_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "organization_role" (
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
	CONSTRAINT "organization_role_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "passkey" (
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
	CONSTRAINT "passkey_id_unique" UNIQUE("id"),
	CONSTRAINT "passkey_counter_non_negative_check" CHECK ("passkey"."counter" >= 0)
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
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
	CONSTRAINT "rate_limit_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "scim_provider" (
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
	CONSTRAINT "scim_provider_id_unique" UNIQUE("id"),
	CONSTRAINT "scim_provider_provider_id_unique" UNIQUE("provider_id"),
	CONSTRAINT "scim_provider_scim_token_unique" UNIQUE("scim_token")
);
--> statement-breakpoint
CREATE TABLE "sso_provider" (
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
	CONSTRAINT "sso_provider_id_unique" UNIQUE("id"),
	CONSTRAINT "sso_provider_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
CREATE TABLE "subscription" (
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
	"period_start" timestamp,
	"period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"seats" integer,
	CONSTRAINT "subscription_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "team_member" (
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
	CONSTRAINT "team_member_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
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
	CONSTRAINT "two_factor_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
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
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "verification_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "wallet_address" (
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
	CONSTRAINT "wallet_address_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "file" (
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
	CONSTRAINT "file_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_discussion_id_discussion_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_block" ADD CONSTRAINT "knowledge_block_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_block" ADD CONSTRAINT "knowledge_block_page_id_knowledge_page_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."knowledge_page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_block" ADD CONSTRAINT "knowledge_block_last_edited_by_user_id_fk" FOREIGN KEY ("last_edited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_page" ADD CONSTRAINT "knowledge_page_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_page" ADD CONSTRAINT "knowledge_page_space_id_knowledge_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."knowledge_space"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_space" ADD CONSTRAINT "knowledge_space_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_space" ADD CONSTRAINT "knowledge_space_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_space" ADD CONSTRAINT "knowledge_space_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_link" ADD CONSTRAINT "page_link_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "page_link" ADD CONSTRAINT "page_link_source_page_id_knowledge_page_id_fk" FOREIGN KEY ("source_page_id") REFERENCES "public"."knowledge_page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_link" ADD CONSTRAINT "page_link_target_page_id_knowledge_page_id_fk" FOREIGN KEY ("target_page_id") REFERENCES "public"."knowledge_page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_link" ADD CONSTRAINT "page_link_source_block_id_knowledge_block_id_fk" FOREIGN KEY ("source_block_id") REFERENCES "public"."knowledge_block"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_impersonated_by_user_id_fk" FOREIGN KEY ("impersonated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_organization_id_organization_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_team_id_team_id_fk" FOREIGN KEY ("active_team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_code" ADD CONSTRAINT "device_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_application" ADD CONSTRAINT "oauth_application_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "oauth_application" ADD CONSTRAINT "oauth_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_consent" ADD CONSTRAINT "oauth_consent_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "oauth_consent" ADD CONSTRAINT "oauth_consent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_role" ADD CONSTRAINT "organization_role_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scim_provider" ADD CONSTRAINT "scim_provider_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sso_provider" ADD CONSTRAINT "sso_provider_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sso_provider" ADD CONSTRAINT "sso_provider_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_address" ADD CONSTRAINT "wallet_address_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "organization_name_idx" ON "organization" USING btree ("name");--> statement-breakpoint
CREATE INDEX "organization_slug_idx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organization_type_idx" ON "organization" USING btree ("type");--> statement-breakpoint
CREATE INDEX "organization_owner_idx" ON "organization" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "organization_personal_idx" ON "organization" USING btree ("is_personal") WHERE "organization"."is_personal" = true;--> statement-breakpoint
CREATE INDEX "organization_subscription_idx" ON "organization" USING btree ("subscription_tier","subscription_status");--> statement-breakpoint
CREATE INDEX "team_organization_id_idx" ON "team" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_org_name_unique_idx" ON "team" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "team_name_idx" ON "team" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_active_idx" ON "user" USING btree ("id","email_verified") WHERE "user"."banned" IS NOT TRUE AND "user"."email_verified" = true;--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role") WHERE "user"."role" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "user_banned_expires_idx" ON "user" USING btree ("ban_expires") WHERE "user"."banned" = true AND "user"."ban_expires" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "user_2fa_enabled_idx" ON "user" USING btree ("two_factor_enabled") WHERE "user"."two_factor_enabled" = true;--> statement-breakpoint
CREATE INDEX "comment_discussion_idx" ON "comment" USING btree ("discussion_id");--> statement-breakpoint
CREATE INDEX "comment_user_idx" ON "comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discussion_document_idx" ON "discussion" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "discussion_user_idx" ON "discussion" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discussion_is_resolved_idx" ON "discussion" USING btree ("is_resolved");--> statement-breakpoint
CREATE UNIQUE INDEX "document_user_template_idx" ON "document" USING btree ("user_id","template_id");--> statement-breakpoint
CREATE INDEX "document_user_idx" ON "document" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_parent_idx" ON "document" USING btree ("parent_document_id");--> statement-breakpoint
CREATE INDEX "document_is_published_idx" ON "document" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "document_is_archived_idx" ON "document" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "document_search_idx" ON "document" USING gin ((
        setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("content", '')), 'B')
      ));--> statement-breakpoint
CREATE INDEX "document_file_user_idx" ON "document_file" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_file_document_idx" ON "document_file" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_file_type_idx" ON "document_file" USING btree ("type");--> statement-breakpoint
CREATE INDEX "document_version_document_idx" ON "document_version" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_version_user_idx" ON "document_version" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "knowledge_block_page_idx" ON "knowledge_block" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "knowledge_block_parent_idx" ON "knowledge_block" USING btree ("parent_block_id");--> statement-breakpoint
CREATE INDEX "knowledge_block_order_idx" ON "knowledge_block" USING btree ("page_id","order");--> statement-breakpoint
CREATE INDEX "knowledge_block_content_hash_idx" ON "knowledge_block" USING btree ("content_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_page_space_slug_idx" ON "knowledge_page" USING btree ("space_id","slug");--> statement-breakpoint
CREATE INDEX "knowledge_page_space_idx" ON "knowledge_page" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "knowledge_page_parent_idx" ON "knowledge_page" USING btree ("parent_page_id");--> statement-breakpoint
CREATE INDEX "knowledge_page_status_idx" ON "knowledge_page" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_space_org_slug_idx" ON "knowledge_space" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "knowledge_space_owner_idx" ON "knowledge_space" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "page_link_source_idx" ON "page_link" USING btree ("source_page_id");--> statement-breakpoint
CREATE INDEX "page_link_target_idx" ON "page_link" USING btree ("target_page_id");--> statement-breakpoint
CREATE INDEX "page_link_type_idx" ON "page_link" USING btree ("link_type");--> statement-breakpoint
CREATE UNIQUE INDEX "page_link_source_target_block_idx" ON "page_link" USING btree ("source_page_id","target_page_id","source_block_id");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "session_user_expires_idx" ON "session" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "session_active_org_idx" ON "session" USING btree ("active_organization_id");--> statement-breakpoint
CREATE INDEX "session_active_team_idx" ON "session" USING btree ("active_team_id");--> statement-breakpoint
CREATE INDEX "session_impersonated_by_idx" ON "session" USING btree ("impersonated_by");--> statement-breakpoint
CREATE INDEX "session_user_org_active_idx" ON "session" USING btree ("user_id","active_organization_id","expires_at");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_unique_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "account_provider_id_idx" ON "account" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "account_user_provider_idx" ON "account" USING btree ("user_id","provider_id");--> statement-breakpoint
CREATE INDEX "account_access_token_expires_idx" ON "account" USING btree ("access_token_expires_at") WHERE "account"."access_token_expires_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "account_refresh_token_expires_idx" ON "account" USING btree ("refresh_token_expires_at") WHERE "account"."refresh_token_expires_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "invitation_organization_id_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_inviter_id_idx" ON "invitation" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "invitation_org_email_unique_idx" ON "invitation" USING btree ("organization_id","email") WHERE "invitation"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "invitation_status_idx" ON "invitation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invitation_expires_at_idx" ON "invitation" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invitation_pending_idx" ON "invitation" USING btree ("organization_id","status","expires_at") WHERE "invitation"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "invitation_team_id_idx" ON "invitation" USING btree ("team_id") WHERE "invitation"."team_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "member_organization_id_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_user_id_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_org_user_unique_idx" ON "member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "member_org_role_idx" ON "member" USING btree ("organization_id","role");--> statement-breakpoint
CREATE INDEX "member_role_idx" ON "member" USING btree ("role");--> statement-breakpoint
CREATE INDEX "member_status_idx" ON "member" USING btree ("status");--> statement-breakpoint
CREATE INDEX "member_org_status_idx" ON "member" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "member_invited_by_idx" ON "member" USING btree ("invited_by");--> statement-breakpoint
CREATE INDEX "member_last_active_idx" ON "member" USING btree ("last_active_at");--> statement-breakpoint
CREATE INDEX "team_member_team_id_idx" ON "team_member" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_member_user_id_idx" ON "team_member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_member_team_user_unique_idx" ON "team_member" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "team_member_team_user_idx" ON "team_member" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_identifier_value_idx" ON "verification" USING btree ("identifier","value");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verification_active_idx" ON "verification" USING btree ("identifier","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_address_user_chain_id_unique_idx" ON "wallet_address" USING btree ("user_id","address","chain_id");