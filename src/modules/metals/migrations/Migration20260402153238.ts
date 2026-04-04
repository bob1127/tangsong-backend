import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260402153238 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "metal_price" drop column if exists "gold_price_qian", drop column if exists "platinum_price_qian", drop column if exists "silver_price_qian";`);

    this.addSql(`alter table if exists "metal_price" add column if not exists "fetch_timestamp" timestamptz not null, add column if not exists "raw_rates_data" jsonb not null, add column if not exists "spot_gold_usd_oz" integer not null, add column if not exists "spot_silver_usd_oz" integer not null, add column if not exists "spot_platinum_usd_oz" integer not null, add column if not exists "spot_palladium_usd_oz" integer null, add column if not exists "base_gold_twd_qian" integer not null, add column if not exists "base_silver_twd_qian" integer not null, add column if not exists "base_platinum_twd_qian" integer not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "metal_price" drop column if exists "fetch_timestamp", drop column if exists "raw_rates_data", drop column if exists "spot_gold_usd_oz", drop column if exists "spot_silver_usd_oz", drop column if exists "spot_platinum_usd_oz", drop column if exists "spot_palladium_usd_oz", drop column if exists "base_gold_twd_qian", drop column if exists "base_silver_twd_qian", drop column if exists "base_platinum_twd_qian";`);

    this.addSql(`alter table if exists "metal_price" add column if not exists "gold_price_qian" integer not null, add column if not exists "platinum_price_qian" integer not null, add column if not exists "silver_price_qian" integer not null;`);
  }

}
