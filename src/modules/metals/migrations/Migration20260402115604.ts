import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260402115604 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "metal_price" ("id" text not null, "gold_price_qian" integer not null, "platinum_price_qian" integer not null, "silver_price_qian" integer not null, "exchange_rate_usd_twd" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "metal_price_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_metal_price_deleted_at" ON "metal_price" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "metal_price" cascade;`);
  }

}
