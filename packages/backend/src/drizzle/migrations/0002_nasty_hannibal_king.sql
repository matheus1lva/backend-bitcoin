ALTER TABLE "user" RENAME COLUMN "btcAddress" TO "btcReceiveAddress";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "btcKey" text NOT NULL;