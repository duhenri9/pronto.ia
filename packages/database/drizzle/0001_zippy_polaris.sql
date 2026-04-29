ALTER TABLE "users" ALTER COLUMN "lifecycle_state" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "lifecycle_state" SET DEFAULT 'provisional'::text;--> statement-breakpoint
DROP TYPE "public"."lifecycle_state";--> statement-breakpoint
CREATE TYPE "public"."lifecycle_state" AS ENUM('provisional', 'onboarding', 'active', 'active_pro', 'past_due', 'churned', 'cancelled', 'pro_offer_pending', 'awaiting_lgpd_confirmation');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "lifecycle_state" SET DEFAULT 'provisional'::"public"."lifecycle_state";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "lifecycle_state" SET DATA TYPE "public"."lifecycle_state" USING "lifecycle_state"::"public"."lifecycle_state";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "provider" SET DEFAULT 'ABACATE';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "abacate_checkout_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "method" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_message_after_cancellation" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pro_offer_blocked_until" timestamp with time zone;