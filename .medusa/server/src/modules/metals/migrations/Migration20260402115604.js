"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260402115604 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260402115604 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "metal_price" ("id" text not null, "gold_price_qian" integer not null, "platinum_price_qian" integer not null, "silver_price_qian" integer not null, "exchange_rate_usd_twd" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "metal_price_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_metal_price_deleted_at" ON "metal_price" ("deleted_at") WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "metal_price" cascade;`);
    }
}
exports.Migration20260402115604 = Migration20260402115604;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA0MDIxMTU2MDQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZXRhbHMvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDQwMjExNTYwNC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5RUFBcUU7QUFFckUsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUUzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsK1lBQStZLENBQUMsQ0FBQztRQUM3WixJQUFJLENBQUMsTUFBTSxDQUFDLG1IQUFtSCxDQUFDLENBQUM7SUFDbkksQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsNkNBQTZDLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBRUY7QUFYRCwwREFXQyJ9