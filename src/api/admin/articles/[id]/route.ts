// src/api/admin/articles/[id]/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogModuleService = req.scope.resolve("blog")
    const article = await blogModuleService.retrieveArticle(req.params.id)
    res.json({ article })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogModuleService = req.scope.resolve("blog")
    const data = { ...(req.body as any) }

    if (data.schema_type === "BlogPosting") data.schema_type = "BlogPost"

    // 雙重保險賦值，確保資料庫絕對不會漏接
    if (data.schema_data && !data.faq_schema) data.faq_schema = data.schema_data;
    if (data.faq_schema && !data.schema_data) data.schema_data = data.faq_schema;

    const article = await blogModuleService.updateArticles({
      id: req.params.id,
      ...data
    })

    res.json({ article })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogModuleService = req.scope.resolve("blog")
    await blogModuleService.deleteArticles(req.params.id)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}