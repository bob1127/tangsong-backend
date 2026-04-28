import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260426132309 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "article" add column if not exists "thumbnail" text null, add column if not exists "faq_schema" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "article" drop column if exists "thumbnail", drop column if exists "faq_schema";`);
  }

}
