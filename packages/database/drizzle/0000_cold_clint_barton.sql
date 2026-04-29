CREATE TYPE "public"."enrollment_source" AS ENUM('ORGANIC', 'B2G_CONTRACT', 'B2B_PARTNER', 'AFFILIATE', 'REFERRAL');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."lesson_state" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'EXERCISE_PENDING', 'EXERCISE_SUBMITTED', 'EVALUATED', 'COMPLETED', 'SKIPPED');--> statement-breakpoint
CREATE TYPE "public"."lifecycle_state" AS ENUM('provisional', 'onboarding', 'active', 'at_risk', 'churned', 'pro_offer_pending', 'awaiting_lgpd_confirmation');--> statement-breakpoint
CREATE TYPE "public"."memory_type" AS ENUM('preference', 'context', 'conversation_summary', 'business_info', 'onboarding_data');--> statement-breakpoint
CREATE TYPE "public"."message_direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'audio', 'image', 'document', 'template', 'interactive');--> statement-breakpoint
CREATE TYPE "public"."partner_type" AS ENUM('GOVERNMENT_STATE', 'GOVERNMENT_MUNICIPAL', 'SEBRAE', 'SENAC', 'SENAI', 'SINDICATE', 'ASSOCIATION', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('STRIPE', 'ABACATE', 'PIX', 'BANK_TRANSFER');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('B2C_PRO_MONTHLY', 'B2G_CONTRACT', 'B2B_CONTRACT');--> statement-breakpoint
CREATE TYPE "public"."scheduled_message_status" AS ENUM('pending', 'processing', 'sent', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."trilha_level" AS ENUM('BASIC', 'INTERMEDIATE', 'ADVANCED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'STUDENT', 'COMPANY_ADMIN', 'COMPANY_USER');--> statement-breakpoint
CREATE TYPE "public"."vertical" AS ENUM('SALAO', 'FOOD_SERVICE', 'HOME_SERVICE', 'TECH_SERVICE');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"actor_id" text NOT NULL,
	"actor_type" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"details" jsonb,
	"ip_address" text,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"trilha_id" uuid NOT NULL,
	"verification_code" text NOT NULL,
	"recipient_name" text NOT NULL,
	"trilha_title" text NOT NULL,
	"revenue_before_cents" integer,
	"revenue_after_cents" integer,
	"revenue_lift_cents" integer,
	"revenue_lift_percent" integer,
	"outcome_headline" text,
	"pdf_url" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_enrollment_id_unique" UNIQUE("enrollment_id"),
	CONSTRAINT "certificates_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE "content_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"intro_text" text NOT NULL,
	"body_text" text NOT NULL,
	"tip_text" text,
	"closing_text" text NOT NULL,
	"persona_variant" text,
	"edited_by" text,
	"change_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"mood" text,
	"reflection" text,
	"action_plan" text,
	"daily_revenue_cents" integer,
	"responded" boolean DEFAULT false NOT NULL,
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"vertical" text,
	"active_users" integer DEFAULT 0 NOT NULL,
	"lessons_completed" integer DEFAULT 0 NOT NULL,
	"exercises_passed" integer DEFAULT 0 NOT NULL,
	"exercises_failed" integer DEFAULT 0 NOT NULL,
	"daily_checkins" integer DEFAULT 0 NOT NULL,
	"total_revenue_lift_cents" integer DEFAULT 0 NOT NULL,
	"avg_revenue_lift_percent" real DEFAULT 0 NOT NULL,
	"new_enrollments" integer DEFAULT 0 NOT NULL,
	"new_pro_subscriptions" integer DEFAULT 0 NOT NULL,
	"llm_cost_cents" integer DEFAULT 0 NOT NULL,
	"llm_calls_count" integer DEFAULT 0 NOT NULL,
	"whatsapp_cost_cents" integer DEFAULT 0 NOT NULL,
	"whatsapp_messages_sent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"trilha_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'ACTIVE' NOT NULL,
	"source" "enrollment_source" DEFAULT 'ORGANIC' NOT NULL,
	"current_day" integer DEFAULT 1 NOT NULL,
	"current_lesson_id" uuid,
	"completed_lessons" integer DEFAULT 0 NOT NULL,
	"total_lessons" integer DEFAULT 0 NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paused_at" timestamp with time zone,
	"reported_revenue_before_cents" integer,
	"reported_revenue_after_cents" integer,
	"reported_outcome_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_progress_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"student_response" text NOT NULL,
	"evaluation_model" text NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"feedback_text" text NOT NULL,
	"improvement_tips" text,
	"relevance_score" integer,
	"completeness_score" integer,
	"practicality_score" integer,
	"llm_call_id" uuid,
	"tokens_used" integer NOT NULL,
	"estimated_cost_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercise_evaluations_lesson_progress_id_unique" UNIQUE("lesson_progress_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"state" "lesson_state" DEFAULT 'NOT_STARTED' NOT NULL,
	"lesson_delivered_at" timestamp with time zone,
	"audio_delivered_at" timestamp with time zone,
	"exercise_prompt_sent_at" timestamp with time zone,
	"exercise_response_text" text,
	"exercise_response_media_url" text,
	"exercise_submitted_at" timestamp with time zone,
	"exercise_retries" integer DEFAULT 0 NOT NULL,
	"score" integer,
	"feedback_text" text,
	"evaluated_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"time_spent_sec" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trilha_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"day_number" integer NOT NULL,
	"active_version_id" uuid,
	"duration_min" integer DEFAULT 5 NOT NULL,
	"has_exercise" boolean DEFAULT true NOT NULL,
	"exercise_prompt" text,
	"audio_url" text,
	"audio_duration_sec" integer,
	"image_url" text,
	"document_url" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lessons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "llm_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"model" text NOT NULL,
	"persona" text NOT NULL,
	"prompt_version" text,
	"system_prompt_hash" text,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"finish_reason" text,
	"estimated_cost_cents" integer NOT NULL,
	"latency_ms" integer NOT NULL,
	"lesson_id" uuid,
	"session_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outcome_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"period_days" integer NOT NULL,
	"revenue_before_cents" integer NOT NULL,
	"revenue_after_cents" integer NOT NULL,
	"revenue_lift_cents" integer NOT NULL,
	"revenue_lift_percent" real NOT NULL,
	"top_takeaway" text,
	"would_recommend" boolean DEFAULT true NOT NULL,
	"testimonial_text" text,
	"reported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "partner_type" NOT NULL,
	"cnpj" text,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"contract_value_cents" integer,
	"contract_start" timestamp with time zone,
	"contract_end" timestamp with time zone,
	"max_students" integer DEFAULT 0 NOT NULL,
	"seats_used" integer DEFAULT 0 NOT NULL,
	"vertical_focus" "vertical",
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partners_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"amount_cents" integer NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"type" "payment_type" NOT NULL,
	"provider" "payment_provider" DEFAULT 'STRIPE' NOT NULL,
	"provider_id" text,
	"metadata" jsonb,
	"is_subscription" boolean DEFAULT false NOT NULL,
	"plan_type" text,
	"paid_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processed_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"scheduled_for" timestamp with time zone NOT NULL,
	"message_type" "message_type" DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"status" "scheduled_message_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"last_error" text,
	"sent_at" timestamp with time zone,
	"enrollment_id" uuid,
	"lesson_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"abacate_subscription_id" text,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trilhas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"vertical" "vertical" NOT NULL,
	"level" "trilha_level" DEFAULT 'BASIC' NOT NULL,
	"is_pro" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"estimated_days" integer DEFAULT 30 NOT NULL,
	"total_lessons" integer DEFAULT 0 NOT NULL,
	"persona_name" text DEFAULT 'Bia' NOT NULL,
	"persona_slug" text DEFAULT 'bia' NOT NULL,
	"icon_url" text,
	"banner_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trilhas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"memory_type" "memory_type" NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"source" text,
	"confidence" integer,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"avatar_url" text,
	"vertical" "vertical",
	"business_name" text,
	"business_type" text,
	"business_context" jsonb,
	"city" text,
	"state" text,
	"display_name" text,
	"preferred_time" text,
	"preferred_contact_window" text,
	"daily_lesson_opt_in" boolean DEFAULT false NOT NULL,
	"reengagement_opt_in" boolean DEFAULT false NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"onboarding_step" integer,
	"onboarding_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_pro" boolean DEFAULT false NOT NULL,
	"pro_expires_at" timestamp with time zone,
	"pro_offered_at" timestamp with time zone,
	"stripe_customer_id" text,
	"lifecycle_state" "lifecycle_state" DEFAULT 'provisional' NOT NULL,
	"pending_action" text,
	"lgpd_consent_at" timestamp with time zone,
	"lgpd_consent_version" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"wa_message_id" text,
	"direction" "message_direction" NOT NULL,
	"message_type" "message_type" NOT NULL,
	"text_content" text,
	"media_url" text,
	"media_id" text,
	"template_name" text,
	"interactive_payload" jsonb,
	"persona_used" text,
	"lesson_id" uuid,
	"enrollment_id" uuid,
	"llm_call_id" uuid,
	"tokens_used" integer,
	"status" "message_status" DEFAULT 'pending' NOT NULL,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone_number" text NOT NULL,
	"wa_id" text,
	"current_persona" text DEFAULT 'maria' NOT NULL,
	"current_flow" text,
	"flow_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_message_at" timestamp with time zone,
	"message_count" integer DEFAULT 0 NOT NULL,
	"session_window_start" timestamp with time zone,
	"is_in_session_window" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_sessions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "whatsapp_sessions_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_trilha_id_trilhas_id_fk" FOREIGN KEY ("trilha_id") REFERENCES "public"."trilhas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_trilha_id_trilhas_id_fk" FOREIGN KEY ("trilha_id") REFERENCES "public"."trilhas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_evaluations" ADD CONSTRAINT "exercise_evaluations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_evaluations" ADD CONSTRAINT "exercise_evaluations_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_trilha_id_trilhas_id_fk" FOREIGN KEY ("trilha_id") REFERENCES "public"."trilhas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_calls" ADD CONSTRAINT "llm_calls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcome_reports" ADD CONSTRAINT "outcome_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_session_id_whatsapp_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."whatsapp_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memory" ADD CONSTRAINT "user_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_session_id_whatsapp_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."whatsapp_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "whatsapp_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_resource" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_audit_created" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_certificates_code" ON "certificates" USING btree ("verification_code");--> statement-breakpoint
CREATE INDEX "idx_certificates_user" ON "certificates" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_content_version_unique" ON "content_versions" USING btree ("lesson_id","version","persona_variant");--> statement-breakpoint
CREATE INDEX "idx_content_versions_lesson" ON "content_versions" USING btree ("lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_checkins_user_enrollment_day" ON "daily_checkins" USING btree ("user_id","enrollment_id","day_number");--> statement-breakpoint
CREATE INDEX "idx_checkins_user" ON "daily_checkins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_checkins_enrollment" ON "daily_checkins" USING btree ("enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_daily_metrics_date_vertical" ON "daily_metrics" USING btree ("date","vertical");--> statement-breakpoint
CREATE INDEX "idx_daily_metrics_date" ON "daily_metrics" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_enrollments_user_trilha" ON "enrollments" USING btree ("user_id","trilha_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_user" ON "enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_trilha" ON "enrollments" USING btree ("trilha_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_status" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_last_activity" ON "enrollments" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "idx_evaluations_user" ON "exercise_evaluations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_evaluations_lesson" ON "exercise_evaluations" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_evaluations_passed" ON "exercise_evaluations" USING btree ("passed");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_progress_enrollment_lesson" ON "lesson_progress" USING btree ("enrollment_id","lesson_id");--> statement-breakpoint
CREATE INDEX "idx_progress_user" ON "lesson_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_progress_lesson" ON "lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_progress_state" ON "lesson_progress" USING btree ("state");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_lessons_trilha_day" ON "lessons" USING btree ("trilha_id","day_number");--> statement-breakpoint
CREATE INDEX "idx_lessons_trilha_order" ON "lessons" USING btree ("trilha_id","order");--> statement-breakpoint
CREATE INDEX "idx_lessons_published" ON "lessons" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_llm_calls_user" ON "llm_calls" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_llm_calls_persona" ON "llm_calls" USING btree ("persona");--> statement-breakpoint
CREATE INDEX "idx_llm_calls_model" ON "llm_calls" USING btree ("model");--> statement-breakpoint
CREATE INDEX "idx_llm_calls_created" ON "llm_calls" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_outcomes_user_enrollment_period" ON "outcome_reports" USING btree ("user_id","enrollment_id","period_days");--> statement-breakpoint
CREATE INDEX "idx_outcomes_enrollment" ON "outcome_reports" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "idx_outcomes_reported" ON "outcome_reports" USING btree ("reported_at");--> statement-breakpoint
CREATE INDEX "idx_partners_type" ON "partners" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_partners_active" ON "partners" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_payments_user" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_provider_id" ON "payments" USING btree ("provider","provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_processed_events_provider_id" ON "processed_events" USING btree ("provider","event_id");--> statement-breakpoint
CREATE INDEX "idx_processed_events_at" ON "processed_events" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "idx_scheduled_messages_for" ON "scheduled_messages" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_scheduled_messages_status" ON "scheduled_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_scheduled_messages_user" ON "scheduled_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_abacate_id" ON "subscriptions" USING btree ("abacate_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_trilhas_vertical_level" ON "trilhas" USING btree ("vertical","level");--> statement-breakpoint
CREATE INDEX "idx_trilhas_slug" ON "trilhas" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_trilhas_published" ON "trilhas" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_user_memory_user_type" ON "user_memory" USING btree ("user_id","memory_type");--> statement-breakpoint
CREATE INDEX "idx_user_memory_user_key" ON "user_memory" USING btree ("user_id","key");--> statement-breakpoint
CREATE INDEX "idx_user_memory_expires" ON "user_memory" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_vertical" ON "users" USING btree ("vertical");--> statement-breakpoint
CREATE INDEX "idx_users_is_pro" ON "users" USING btree ("is_pro");--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_users_lifecycle_state" ON "users" USING btree ("lifecycle_state");--> statement-breakpoint
CREATE INDEX "idx_wa_messages_session" ON "whatsapp_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wa_messages_user" ON "whatsapp_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wa_messages_direction" ON "whatsapp_messages" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "idx_wa_messages_created" ON "whatsapp_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_wa_sessions_phone" ON "whatsapp_sessions" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "idx_wa_sessions_last_message" ON "whatsapp_sessions" USING btree ("last_message_at");