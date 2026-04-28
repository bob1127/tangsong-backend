import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260424050456 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "article" drop constraint if exists "article_handle_unique";`);
    this.addSql(`create table if not exists "article" ("id" text not null, "title" text not null, "handle" text not null, "content" text not null, "seo_title" text null, "seo_description" text null, "seo_keywords" text null, "schema_type" text check ("schema_type" in ('Article', 'BlogPost', 'NewsArticle')) not null default 'BlogPost', "faq_schema" jsonb null, "is_published" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "article_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_article_handle_unique" ON "article" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_article_deleted_at" ON "article" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "article" cascade;`);
  }

}
