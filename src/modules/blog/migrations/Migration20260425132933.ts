import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260425132933 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "article" rename column "faq_schema" to "schema_data";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "article" rename column "schema_data" to "faq_schema";`);
  }

}
