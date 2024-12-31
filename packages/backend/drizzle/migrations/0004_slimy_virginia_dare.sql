CREATE TABLE "authenticators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"credential_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" text NOT NULL,
	"credential_device_type" text NOT NULL,
	"credential_backed_up" text NOT NULL,
	"transports" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "authenticators_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt"::timestamp;
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt"::timestamp;
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;