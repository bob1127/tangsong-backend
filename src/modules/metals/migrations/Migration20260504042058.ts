import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260504042058 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "metal_price" add column if not exists "base_palladium_twd_qian" integer null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "metal_price" drop column if exists "base_palladium_twd_qian";`);
  }

}
