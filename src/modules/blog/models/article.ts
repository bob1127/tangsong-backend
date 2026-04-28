// src/modules/blog/models/article.ts
import { model } from "@medusajs/framework/utils"

export const Article = model.define("article", {
  id: model.id().primaryKey(),
  title: model.text(),
  handle: model.text().unique(), // 網址的 slug，例如 /blog/my-first-post
  content: model.text(), // 存放富文本編輯器產出的 HTML
  
  // 👇 沒錯！就是這裡要加上 thumbnail 欄位，用來存文章主圖！
  thumbnail: model.text().nullable(), 
  
  // 💡 SEO 與結構化資料 (參考 Rank Math)
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  seo_keywords: model.text().nullable(),
  schema_type: model.enum(["Article", "BlogPost", "NewsArticle"]).default("BlogPost"),
  
  schema_data: model.json().nullable(), 
  faq_schema: model.json().nullable(), // 保留之前的雙重保險，避免資料庫卡住
  
  is_published: model.boolean().default(false),
})