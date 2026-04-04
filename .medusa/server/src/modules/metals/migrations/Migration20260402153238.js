"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260402153238 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260402153238 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "metal_price" drop column if exists "gold_price_qian", drop column if exists "platinum_price_qian", drop column if exists "silver_price_qian";`);
        this.addSql(`alter table if exists "metal_price" add column if not exists "fetch_timestamp" timestamptz not null, add column if not exists "raw_rates_data" jsonb not null, add column if not exists "spot_gold_usd_oz" integer not null, add column if not exists "spot_silver_usd_oz" integer not null, add column if not exists "spot_platinum_usd_oz" integer not null, add column if not exists "spot_palladium_usd_oz" integer null, add column if not exists "base_gold_twd_qian" integer not null, add column if not exists "base_silver_twd_qian" integer not null, add column if not exists "base_platinum_twd_qian" integer not null;`);
    }
    async down() {
        this.addSql(`alter table if exists "metal_price" drop column if exists "fetch_timestamp", drop column if exists "raw_rates_data", drop column if exists "spot_gold_usd_oz", drop column if exists "spot_silver_usd_oz", drop column if exists "spot_platinum_usd_oz", drop column if exists "spot_palladium_usd_oz", drop column if exists "base_gold_twd_qian", drop column if exists "base_silver_twd_qian", drop column if exists "base_platinum_twd_qian";`);
        this.addSql(`alter table if exists "metal_price" add column if not exists "gold_price_qian" integer not null, add column if not exists "platinum_price_qian" integer not null, add column if not exists "silver_price_qian" integer not null;`);
    }
}
exports.Migration20260402153238 = Migration20260402153238;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA0MDIxNTMyMzguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZXRhbHMvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDQwMjE1MzIzOC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUUzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsc0tBQXNLLENBQUMsQ0FBQztRQUVwTCxJQUFJLENBQUMsTUFBTSxDQUFDLHFtQkFBcW1CLENBQUMsQ0FBQztJQUNybkIsQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsbWJBQW1iLENBQUMsQ0FBQztRQUVqYyxJQUFJLENBQUMsTUFBTSxDQUFDLGtPQUFrTyxDQUFDLENBQUM7SUFDbFAsQ0FBQztDQUVGO0FBZEQsMERBY0MifQ==